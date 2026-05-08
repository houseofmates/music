import os
import subprocess
import tempfile
import threading
from pathlib import Path
from typing import Optional, Iterator, Tuple, Dict, Any
from fastapi import HTTPException
from fastapi.responses import StreamingResponse, FileResponse
import ffmpeg
import logging

logger = logging.getLogger(__name__)

class AudioProcessingService:
    """Service for premium audio processing with real-time effects."""

    # Equalizer preset profiles
    EQUALIZER_PRESETS = {
        'flat': {
            'name': 'Flat',
            'description': 'No equalization',
            'filters': []
        },
        'rock': {
            'name': 'Rock',
            'description': 'Enhanced bass and treble for rock music',
            'filters': [
                'bass=g=3:f=100',  # Boost bass
                'treble=g=2:f=3000',  # Boost treble
                'highpass=f=80',  # Cut sub-bass
                'lowpass=f=16000'  # Cut ultra-high frequencies
            ]
        },
        'jazz': {
            'name': 'Jazz',
            'description': 'Warm, balanced sound for jazz',
            'filters': [
                'bass=g=2:f=150',  # Gentle bass boost
                'treble=g=1:f=5000',  # Subtle treble enhancement
                'highpass=f=60',  # Gentle high-pass
                'lowpass=f=18000'  # Extended high frequencies
            ]
        },
        'classical': {
            'name': 'Classical',
            'description': 'Natural, acoustic sound for classical music',
            'filters': [
                'bass=g=1:f=120',  # Minimal bass boost
                'treble=g=1.5:f=8000',  # Air and detail
                'highpass=f=40',  # Very gentle high-pass
                'lowpass=f=20000'  # Full frequency response
            ]
        },
        'pop': {
            'name': 'Pop',
            'description': 'Bright, present sound for pop music',
            'filters': [
                'bass=g=2.5:f=120',  # Punchy bass
                'treble=g=2:f=4000',  # Brightness
                'highpass=f=70',  # Clean low end
                'lowpass=f=17000'  # Clear highs
            ]
        },
        'electronic': {
            'name': 'Electronic',
            'description': 'Enhanced for electronic and dance music',
            'filters': [
                'bass=g=4:f=90',  # Heavy bass boost
                'treble=g=1:f=6000',  # Crisp highs
                'highpass=f=50',  # Subsonic filter
                'lowpass=f=16000'  # Clean cutoff
            ]
        },
        'vocal': {
            'name': 'Vocal',
            'description': 'Enhanced vocal clarity and presence',
            'filters': [
                'bass=g=0.5:f=200',  # Reduce mud
                'treble=g=3:f=5000',  # Vocal presence
                'equalizer=f=3000:width_type=o:width=1:g=-2',  # Cut mud
                'equalizer=f=8000:width_type=o:width=1:g=2'  # Air
            ]
        }
    }

    # Audio effects
    AUDIO_EFFECTS = {
        'reverb': {
            'name': 'Reverb',
            'description': 'Add spaciousness and depth',
            'filter': 'aecho=0.8:0.9:1000:0.3'
        },
        'echo': {
            'name': 'Echo',
            'description': 'Classic echo effect',
            'filter': 'aecho=0.8:0.88:60:0.4'
        },
        'bass_boost': {
            'name': 'Bass Boost',
            'description': 'Enhance low frequencies',
            'filter': 'bass=g=5:f=100'
        },
        'high_boost': {
            'name': 'High Boost',
            'description': 'Enhance high frequencies',
            'filter': 'treble=g=3:f=5000'
        },
        'warmth': {
            'name': 'Warmth',
            'description': 'Add analog warmth',
            'filter': 'lowshelf=g=2:f=80'
        },
        'brightness': {
            'name': 'Brightness',
            'description': 'Add sparkle and clarity',
            'filter': 'highshelf=g=2:f=8000'
        }
    }

    # Spatial audio presets
    SPATIAL_PRESETS = {
        'mono': {
            'name': 'Mono',
            'description': 'Single channel audio',
            'filters': ['pan=mono:c0=FL']
        },
        'stereo': {
            'name': 'Stereo',
            'description': 'Standard stereo',
            'filters': []
        },
        'wide_stereo': {
            'name': 'Wide Stereo',
            'description': 'Enhanced stereo width',
            'filters': ['extrastereo=m=2.5', 'stereowiden=delay=20']
        },
        'surround': {
            'name': 'Surround',
            'description': '5.1 surround sound simulation',
            'filters': ['surround=5.1:FL=FL:FR=FR:FC=FC:LFE=LFE:BL=BL:BR=BR']
        },
        'headphones': {
            'name': 'Headphones',
            'description': 'Optimized for headphone listening',
            'filters': ['headphone=type=waves', 'extrastereo=m=1.5']
        }
    }

    @staticmethod
    def get_equalizer_presets() -> Dict[str, Dict]:
        """Get available equalizer presets."""
        return AudioProcessingService.EQUALIZER_PRESETS

    @staticmethod
    def get_audio_effects() -> Dict[str, Dict]:
        """Get available audio effects."""
        return AudioProcessingService.AUDIO_EFFECTS

    @staticmethod
    def get_spatial_presets() -> Dict[str, Dict]:
        """Get available spatial audio presets."""
        return AudioProcessingService.SPATIAL_PRESETS

    @staticmethod
    def build_audio_filter_chain(
        equalizer_preset: Optional[str] = None,
        custom_equalizer: Optional[Dict] = None,
        effects: Optional[list] = None,
        spatial_preset: Optional[str] = None,
        normalize: bool = False,
        compression: bool = False,
        compression_settings: Optional[Dict] = None
    ) -> str:
        """Build FFmpeg audio filter chain from processing settings."""

        filters = []

        # Add normalization
        if normalize:
            filters.append('loudnorm=I=-16:TP=-1.5:LRA=11')

        # Add dynamic range compression
        if compression:
            settings = compression_settings or {}
            attack = settings.get('attack', 0.3)
            release = settings.get('release', 0.8)
            threshold = settings.get('threshold', -20)
            ratio = settings.get('ratio', 4)
            makeup = settings.get('makeup', 8)

            filters.append(f'compand=attacks={attack}:decays={release}:points=-70/-60|-30/-15|{threshold}/{threshold}|20/20:soft-knee=6:gain={makeup}')

        # Add equalizer
        if equalizer_preset and equalizer_preset in AudioProcessingService.EQUALIZER_PRESETS:
            preset_filters = AudioProcessingService.EQUALIZER_PRESETS[equalizer_preset]['filters']
            filters.extend(preset_filters)
        elif custom_equalizer:
            # Build custom equalizer filters
            for band in custom_equalizer.get('bands', []):
                freq = band.get('frequency', 1000)
                gain = band.get('gain', 0)
                width = band.get('width', 1)
                filters.append(f'equalizer=f={freq}:width_type=o:width={width}:g={gain}')

        # Add audio effects
        if effects:
            for effect in effects:
                if effect in AudioProcessingService.AUDIO_EFFECTS:
                    filters.append(AudioProcessingService.AUDIO_EFFECTS[effect]['filter'])

        # Add spatial audio
        if spatial_preset and spatial_preset in AudioProcessingService.SPATIAL_PRESETS:
            spatial_filters = AudioProcessingService.SPATIAL_PRESETS[spatial_preset]['filters']
            filters.extend(spatial_filters)

        # Combine all filters
        if filters:
            return ','.join(filters)
        return None

    @staticmethod
    def process_audio_stream(
        file_path: str,
        range_header: Optional[str] = None,
        quality: str = 'streaming',
        processing_settings: Optional[Dict] = None
    ) -> StreamingResponse:
        """Process and stream audio with effects."""

        resolved_path = AudioProcessingService._resolve_file_path(file_path)
        if not resolved_path or not os.path.exists(resolved_path):
            raise HTTPException(status_code=404, detail="Audio file not found")

        ext = Path(resolved_path).suffix.lower()
        if ext not in {'.mp3', '.flac', '.m4a', '.ogg', '.wav', '.webm', '.opus'}:
            raise HTTPException(status_code=400, detail="Unsupported audio format")

        # Build audio filter chain
        audio_filter = None
        if processing_settings:
            audio_filter = AudioProcessingService.build_audio_filter_chain(
                equalizer_preset=processing_settings.get('equalizer_preset'),
                custom_equalizer=processing_settings.get('custom_equalizer'),
                effects=processing_settings.get('effects', []),
                spatial_preset=processing_settings.get('spatial_preset'),
                normalize=processing_settings.get('normalize', False),
                compression=processing_settings.get('compression', False),
                compression_settings=processing_settings.get('compression_settings')
            )

        # Get quality profile
        from streaming import StreamingService
        profile = StreamingService.QUALITY_PROFILES.get(quality, StreamingService.QUALITY_PROFILES['streaming'])

        def generate_processed_audio():
            try:
                # Build FFmpeg command
                stream = ffmpeg.input(resolved_path)

                # Apply audio filter if specified
                if audio_filter:
                    stream = stream.filter('aformat', sample_rates='44100:48000:96000')
                    stream = stream.filter(audio_filter)

                # Set output format and quality
                output_args = {
                    'format': 'opus',
                    'audio_bitrate': profile['bitrate'],
                    'acodec': 'libopus',
                    'loglevel': 'error'
                }

                # Run FFmpeg process
                process = (
                    stream
                    .output('pipe:', **output_args)
                    .run_async(pipe_stdout=True, pipe_stderr=True)
                )

                # Stream the processed audio
                while True:
                    chunk = process.stdout.read(8192)
                    if not chunk:
                        break
                    yield chunk

                # Wait for process to finish
                process.wait()

                # Check for errors
                if process.returncode != 0:
                    stderr_output = process.stderr.read().decode('utf-8', errors='ignore')
                    logger.error(f"FFmpeg processing error: {stderr_output}")
                    raise Exception(f"Audio processing failed: {stderr_output}")

            except Exception as e:
                logger.error(f"Error during audio processing: {e}")
                raise

        headers = {
            'Accept-Ranges': 'none',
            'Cache-Control': 'no-cache',  # Don't cache processed streams
            'X-Processed-Audio': 'true',
            'X-Processing-Settings': str(processing_settings) if processing_settings else 'none'
        }

        return StreamingResponse(
            generate_processed_audio(),
            media_type="audio/opus",
            headers=headers
        )

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