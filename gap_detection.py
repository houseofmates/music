import subprocess
import logging
from pathlib import Path
from typing import Optional, Tuple
import ffmpeg

logger = logging.getLogger(__name__)


class GapDetectionService:
    """Service for detecting silent gaps in audio tracks to enable dynamic crossfade."""

    # Silence detection thresholds
    SILENCE_THRESHOLD_DB = -50  # dB below which audio is considered silent
    MIN_SILENCE_DURATION_MS = 100  # Minimum silence duration to detect (ms)
    
    @staticmethod
    def detect_silence_regions(file_path: str, threshold_db: float = None, min_duration_ms: int = None) -> list:
        """
        Detect all silence regions in an audio file using FFmpeg's silencedetect filter.
        
        Returns a list of tuples: [(start_seconds, end_seconds), ...]
        """
        threshold = threshold_db or GapDetectionService.SILENCE_THRESHOLD_DB
        min_duration = (min_duration_ms or GapDetectionService.MIN_SILENCE_DURATION_MS) / 1000.0
        
        try:
            # Run FFmpeg silencedetect filter
            out = ffmpeg.input(file_path)
            out = out.filter('silencedetect', n=f'{threshold}dB', d=min_duration)
            out = out.output('pipe:', format='null')
            
            # Run and capture stderr output (where silencedetect logs)
            process = out.run_async(pipe_stdout=True, pipe_stderr=subprocess.PIPE)
            _, stderr = process.communicate()
            
            stderr_text = stderr.decode('utf-8', errors='ignore')
            
            # Parse silence regions from output
            silence_regions = []
            silence_start = None
            
            for line in stderr_text.split('\n'):
                if 'silence_start:' in line:
                    # Extract start time
                    parts = line.split('silence_start:')
                    if len(parts) > 1:
                        try:
                            silence_start = float(parts[1].strip())
                        except ValueError:
                            pass
                
                elif 'silence_end:' in line:
                    # Extract end time and calculate duration
                    if silence_start is not None:
                        parts = line.split('silence_end:')
                        if len(parts) > 1:
                            try:
                                silence_end = float(parts[1].split('|')[0].strip())
                                silence_regions.append((silence_start, silence_end))
                                silence_start = None
                            except ValueError:
                                pass
            
            return silence_regions
            
        except Exception as e:
            logger.error(f"Error detecting silence in {file_path}: {e}")
            return []

    @staticmethod
    def detect_leading_trailing_silence(file_path: str) -> Tuple[Optional[int], Optional[int]]:
        """
        Detect leading and trailing silence in milliseconds.
        
        Returns: (leading_silence_ms, trailing_silence_ms)
        - leading_silence_ms: Duration of silence at the start (None if no significant silence)
        - trailing_silence_ms: Duration of silence at the end (None if no significant silence)
        """
        try:
            # Get track duration first
            probe = ffmpeg.probe(file_path)
            duration = float(probe['format']['duration'])
            
            # Detect all silence regions
            silence_regions = GapDetectionService.detect_silence_regions(file_path)
            
            if not silence_regions:
                return None, None
            
            leading_silence_ms = None
            trailing_silence_ms = None
            
            # Check for leading silence (starts at or very near 0)
            first_region = silence_regions[0]
            if first_region[0] < 0.5:  # Starts within first 500ms
                leading_silence_ms = int((first_region[1] - first_region[0]) * 1000)
                if leading_silence_ms < GapDetectionService.MIN_SILENCE_DURATION_MS:
                    leading_silence_ms = None
            
            # Check for trailing silence (ends at or very near track end)
            last_region = silence_regions[-1]
            if abs(last_region[1] - duration) < 0.5:  # Ends within last 500ms
                trailing_silence_ms = int((last_region[1] - last_region[0]) * 1000)
                if trailing_silence_ms < GapDetectionService.MIN_SILENCE_DURATION_MS:
                    trailing_silence_ms = None
            
            return leading_silence_ms, trailing_silence_ms
            
        except Exception as e:
            logger.error(f"Error detecting leading/trailing silence in {file_path}: {e}")
            return None, None

    @staticmethod
    def calculate_optimal_crossfade(
        current_track_trailing_silence_ms: Optional[int],
        next_track_leading_silence_ms: Optional[int],
        default_crossfade_ms: int = 600,
        min_crossfade_ms: int = 100,
        max_crossfade_ms: int = 3000
    ) -> int:
        """
        Calculate optimal crossfade duration based on detected silence gaps.
        
        The goal is to crossfade through the silent portions without overlapping
        actual audio content unnecessarily.
        
        Args:
            current_track_trailing_silence_ms: Trailing silence of current track
            next_track_leading_silence_ms: Leading silence of next track
            default_crossfade_ms: Default crossfade duration if no silence detected
            min_crossfade_ms: Minimum crossfade duration
            max_crossfade_ms: Maximum crossfade duration
        
        Returns:
            Optimal crossfade duration in milliseconds
        """
        total_silence_ms = 0
        
        if current_track_trailing_silence_ms:
            total_silence_ms += current_track_trailing_silence_ms
        
        if next_track_leading_silence_ms:
            total_silence_ms += next_track_leading_silence_ms
        
        # If we have detected silence, use it to determine crossfade
        if total_silence_ms > 0:
            # Use most of the silence but leave a small gap for breathing room
            # Crossfade should cover ~80% of the total silence
            optimal = int(total_silence_ms * 0.8)
            
            # Clamp to reasonable bounds
            optimal = max(min_crossfade_ms, min(optimal, max_crossfade_ms))
            return optimal
        
        # No silence detected, use default
        return default_crossfade_ms

    @staticmethod
    def analyze_track_gaps(file_path: str) -> dict:
        """
        Comprehensive gap analysis for a track.
        
        Returns dict with:
        - leading_silence_ms: Duration of leading silence
        - trailing_silence_ms: Duration of trailing silence
        - total_silence_ms: Combined silence
        - recommended_crossfade_ms: Optimal crossfade for transitions
        - silence_regions: All detected silence regions
        """
        leading_ms, trailing_ms = GapDetectionService.detect_leading_trailing_silence(file_path)
        
        total_silence_ms = 0
        if leading_ms:
            total_silence_ms += leading_ms
        if trailing_ms:
            total_silence_ms += trailing_ms
        
        # Calculate recommended crossfade (assuming this track will be crossed with another similar track)
        avg_silence = total_silence_ms // 2 if total_silence_ms > 0 else None
        recommended_crossfade = GapDetectionService.calculate_optimal_crossfade(
            avg_silence,  # Assume similar track on other side
            avg_silence
        ) if avg_silence else 600
        
        silence_regions = GapDetectionService.detect_silence_regions(file_path)
        
        return {
            'leading_silence_ms': leading_ms,
            'trailing_silence_ms': trailing_ms,
            'total_silence_ms': total_silence_ms,
            'recommended_crossfade_ms': recommended_crossfade,
            'silence_regions': silence_regions,
            'has_significant_gaps': total_silence_ms > 500  # More than 500ms total silence
        }
