import os
import subprocess
import tempfile
import threading
from pathlib import Path
from typing import Optional, Iterator, Tuple, Dict
from fastapi import HTTPException
from fastapi.responses import StreamingResponse, FileResponse
import ffmpeg
import logging

logger = logging.getLogger(__name__)

class StreamingService:
    """Service for optimized audio streaming with transcoding support and network handoff."""

    SUPPORTED_FORMATS = {'.mp3', '.flac', '.m4a', '.ogg', '.wav', '.webm', '.opus'}
    TRANSCODE_TO_OPUS = False  # Disabled: transcoding breaks byte-range seeking in browsers

    # Quality profiles for different use cases
    QUALITY_PROFILES = {
        'lossless': {'bitrate': None, 'format': 'original'},  # No transcoding
        'high': {'bitrate': '320k', 'format': 'opus'},       # High quality Opus
        'medium': {'bitrate': '128k', 'format': 'opus'},     # Medium quality Opus
        'low': {'bitrate': '96k', 'format': 'opus'},         # Low quality Opus
        'streaming': {'bitrate': '128k', 'format': 'opus'},  # Default streaming
        'download': {'bitrate': '320k', 'format': 'opus'}    # Download quality
    }

    # Adaptive streaming settings for network conditions
    NETWORK_PROFILES = {
        'wifi': {'bitrate': '128k', 'buffer_size': 8192},
        'mobile': {'bitrate': '96k', 'buffer_size': 4096},
        'slow': {'bitrate': '64k', 'buffer_size': 2048}
    }

    @staticmethod
    def _resolve_file_path(file_path: Optional[str]) -> Optional[str]:
        """Resolve file path for container environment."""
        if not file_path:
            return None

        # If path exists as-is, return it
        if os.path.exists(file_path):
            return file_path

        # Handle /music/... paths - map to actual music directory
        if file_path.startswith('/music'):
            from config import settings
            music_dir = Path(settings.music_dir)
            relative = file_path[7:] if file_path.startswith('/music/') else ''
            if relative:
                translated = music_dir / relative
            else:
                translated = music_dir
            return str(translated) if translated.exists() else None

        return file_path

    @staticmethod
    def should_transcode(file_path: str) -> bool:
        """Check if file should be transcoded to Opus."""
        if not StreamingService.TRANSCODE_TO_OPUS:
            return False

        ext = Path(file_path).suffix.lower()
        # Transcode everything except Opus files
        return ext != '.opus'

    @staticmethod
    def get_transcoded_stream(file_path: str, range_header: Optional[str] = None, quality: str = 'streaming', processing_settings: Optional[Dict] = None) -> StreamingResponse:
        """Stream audio with optional Opus transcoding and audio processing."""
        resolved_path = StreamingService._resolve_file_path(file_path)
        if not resolved_path or not os.path.exists(resolved_path):
            raise HTTPException(status_code=404, detail="Audio file not found")

        ext = Path(resolved_path).suffix.lower()
        if ext not in StreamingService.SUPPORTED_FORMATS:
            raise HTTPException(status_code=400, detail="Unsupported audio format")

        # If audio processing is requested, use the AudioProcessingService
        if processing_settings:
            from audio_processing import AudioProcessingService
            return AudioProcessingService.process_audio_stream(resolved_path, range_header, quality, processing_settings)

        # For 'offline' or 'download' quality, prefer original format (FLAC/Opus)
        if quality in ['offline', 'download', 'lossless'] and ext in ['.flac', '.opus']:
            return StreamingService._stream_direct(resolved_path, range_header)
        elif StreamingService.should_transcode(resolved_path):
            return StreamingService._stream_transcoded_opus(resolved_path, range_header, quality)
        else:
            return StreamingService._stream_direct(resolved_path, range_header)

    @staticmethod
    def _stream_direct(file_path: str, range_header: Optional[str] = None) -> StreamingResponse:
        """Stream file directly with range request support."""
        file_size = os.path.getsize(file_path)

        # Handle range requests for seeking
        if range_header:
            try:
                range_match = range_header.replace('bytes=', '').split('-')
                if len(range_match) != 2:
                    raise ValueError("Invalid range format")
                start = int(range_match[0]) if range_match[0] else 0
                end = int(range_match[1]) if range_match[1] else file_size - 1

                if start >= file_size:
                    raise HTTPException(status_code=416, detail="Range not satisfiable")

                end = min(end, file_size - 1)
                content_length = end - start + 1

                def iter_file_range():
                    with open(file_path, 'rb') as f:
                        f.seek(start)
                        remaining = content_length
                        while remaining > 0:
                            chunk_size = min(8192, remaining)
                            data = f.read(chunk_size)
                            if not data:
                                break
                            remaining -= len(data)
                            yield data

                headers = {
                    'Content-Range': f'bytes {start}-{end}/{file_size}',
                    'Accept-Ranges': 'bytes',
                    'Content-Length': str(content_length),
                }

                ext = Path(file_path).suffix.lower()
                media_type = StreamingService._get_media_type(ext)

                return StreamingResponse(
                    iter_file_range(),
                    status_code=206,
                    media_type=media_type,
                    headers=headers
                )
            except (ValueError, IndexError):
                raise HTTPException(status_code=400, detail="Invalid range header")

        # Full file response
        ext = Path(file_path).suffix.lower()
        media_type = StreamingService._get_media_type(ext)
        filename = Path(file_path).name

        return FileResponse(
            file_path,
            media_type=media_type,
            filename=filename,
            headers={'Accept-Ranges': 'bytes'}
        )

    @staticmethod
    def _stream_transcoded_opus(file_path: str, range_header: Optional[str] = None, quality: str = 'streaming') -> StreamingResponse:
        """Stream file transcoded to Opus format with basic range support."""
        try:
            # For transcoded streams, we support basic range requests by seeking
            # Note: Full byte-range support for transcoded streams is complex
            # For now, we'll serve the full transcoded stream but add range headers

            file_size = os.path.getsize(file_path)

            # Estimate transcoded size (Opus is typically 20-30% of original for 96kbps)
            # This is approximate - actual transcoded size varies
            estimated_transcoded_size = int(file_size * 0.25)  # Conservative estimate

            def generate_opus():
                process = None
                try:
                    # Get quality profile
                    profile = StreamingService.QUALITY_PROFILES.get(quality, StreamingService.QUALITY_PROFILES['streaming'])

                    # If lossless quality requested and file is already FLAC/Opus, stream directly
                    ext = Path(file_path).suffix.lower()
                    if profile['format'] == 'original' and ext in ['.flac', '.opus']:
                        # Stream original file instead of transcoding
                        with open(file_path, 'rb') as f:
                            while True:
                                chunk = f.read(8192)
                                if not chunk:
                                    break
                                yield chunk
                        return

                    # Use ffmpeg to transcode to Opus with quality-specific bitrate
                    process = (
                        ffmpeg
                        .input(file_path)
                        .output(
                            'pipe:',
                            format='opus',
                            audio_bitrate=profile['bitrate'],
                            acodec='libopus',
                            loglevel='error'
                        )
                        .run_async(pipe_stdout=True, pipe_stderr=True)
                    )

                    # Read from stdout in chunks
                    while True:
                        chunk = process.stdout.read(8192)
                        if not chunk:
                            break
                        yield chunk

                    # Wait for process to finish
                    process.wait()

                    # Check for errors (do NOT read stderr after wait to avoid deadlock)
                    if process.returncode != 0:
                        logger.error("FFmpeg transcoding failed with return code %d", process.returncode)
                        raise Exception("Transcoding failed")

                except (OSError, subprocess.SubprocessError) as e:
                    logger.error("Error during Opus transcoding: %s", e)
                    raise
                finally:
                    # Ensure the ffmpeg process is always terminated to avoid zombies
                    if process is not None and process.poll() is None:
                        try:
                            process.terminate()
                            process.wait(timeout=2)
                        except (OSError, subprocess.SubprocessError):
                            try:
                                process.kill()
                            except (OSError, subprocess.SubprocessError):
                                logger.warning("Failed to kill ffmpeg process")

            headers = {
                'Accept-Ranges': 'none',  # Full range support would require transcoding segments
                'Cache-Control': 'public, max-age=31536000',  # Cache transcoded streams for 1 year
                'X-Transcoded-Format': 'opus',
                'X-Original-Size': str(file_size),
            }

            # Add content length if we can estimate it
            if estimated_transcoded_size:
                headers['X-Estimated-Size'] = str(estimated_transcoded_size)

            return StreamingResponse(
                generate_opus(),
                media_type="audio/opus",
                headers=headers
            )

        except (OSError, subprocess.SubprocessError) as e:
            logger.error("Failed to transcode %s: %s", file_path, e)
            # Fallback to direct streaming with full range support
            return StreamingService._stream_direct(file_path, range_header)

    @staticmethod
    def _get_media_type(ext: str) -> str:
        """Get MIME type for audio file extension."""
        media_types = {
            '.mp3': 'audio/mpeg',
            '.flac': 'audio/flac',
            '.m4a': 'audio/mp4',
            '.ogg': 'audio/ogg',
            '.wav': 'audio/wav',
            '.webm': 'audio/webm',
            '.opus': 'audio/opus'
        }
        return media_types.get(ext, 'audio/mpeg')

    @staticmethod
    def preload_metadata(file_path: str) -> dict:
        """Extract and return audio metadata for progressive loading."""
        resolved_path = StreamingService._resolve_file_path(file_path)
        if not resolved_path or not os.path.exists(resolved_path):
            return {}

        try:
            from services import MetadataService
            return MetadataService.extract_metadata(resolved_path)
        except (OSError, KeyError, ValueError) as e:
            logger.error("Error extracting metadata for %s: %s", file_path, e)
            return {}