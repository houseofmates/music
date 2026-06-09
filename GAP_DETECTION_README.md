# Smart Auto Silent Gap Detection & Dynamic Crossfade

## Overview

This feature adds intelligent silence detection to your music app, enabling automatic crossfade adjustment based on the actual silent gaps in your tracks.

## What It Does

### 1. **Silent Gap Detection** (`gap_detection.py`)
- Uses FFmpeg's `silencedetect` filter to analyze audio files
- Detects leading silence (at track start) and trailing silence (at track end)
- Identifies all silence regions within tracks
- Configurable sensitivity thresholds (-50dB default, 100ms minimum duration)

### 2. **Dynamic Crossfade Calculation**
- Automatically calculates optimal crossfade duration based on detected silence
- Formula: Uses ~80% of total silence (trailing + leading) for smooth transitions
- Respects min/max bounds (100ms - 3000ms)
- Falls back to user's default crossfade when no silence detected

### 3. **Database Integration**
- Added fields to `Track` model:
  - `leading_silence_ms`: Silence at track start (milliseconds)
  - `trailing_silence_ms`: Silence at track end (milliseconds)
  - `has_detected_gaps`: Whether gap detection has been run
- Added field to `QueueItem` model:
  - `dynamic_crossfade_ms`: Calculated optimal crossfade for this queue position

## How It Works

### During Library Scan
When a track is scanned (>30 seconds duration):
```python
from gap_detection import GapDetectionService

leading_ms, trailing_ms = GapDetectionService.detect_leading_trailing_silence(file_path)
# Results stored in database automatically
```

### When Adding to Queue
The system:
1. Gets previous track's trailing silence
2. Gets next track's leading silence  
3. Calculates optimal crossfade: `GapDetectionService.calculate_optimal_crossfade()`
4. Stores result in `QueueItem.dynamic_crossfade_ms`

### Example Calculations
| Current Trailing | Next Leading | Total Silence | Optimal Crossfade |
|-----------------|--------------|---------------|-------------------|
| 500ms           | 300ms        | 800ms         | 640ms             |
| 800ms           | None         | 800ms         | 640ms             |
| None            | 1000ms       | 1000ms        | 800ms             |
| None            | None         | 0ms           | 600ms (default)   |
| 5000ms          | 5000ms       | 10000ms       | 3000ms (max clamp)|

## API Changes

### GET /queue
Now returns dynamic crossfade info:
```json
{
  "id": 1,
  "track_id": 42,
  "position": 0,
  "dynamic_crossfade_ms": 640,
  "track": {
    "id": 42,
    "title": "Song Title",
    "leading_silence_ms": 500,
    "trailing_silence_ms": 300,
    "has_detected_gaps": true
  }
}
```

### POST /queue
Automatically calculates and returns dynamic crossfade:
```json
{
  "id": 5,
  "position": 2,
  "dynamic_crossfade_ms": 720
}
```

## Usage

### For Frontend/Player
Your player can now use the `dynamic_crossfade_ms` value from queue items instead of the global user setting:

```javascript
// Instead of using only userSettings.crossfade_seconds
const crossfadeMs = queueItem.dynamic_crossfade_ms || 
                    (userSettings.crossfade_seconds * 1000);
```

### Manual Gap Analysis
```python
from gap_detection import GapDetectionService

# Full analysis
analysis = GapDetectionService.analyze_track_gaps('/path/to/track.mp3')
print(analysis)
# {
#   'leading_silence_ms': 450,
#   'trailing_silence_ms': 320,
#   'total_silence_ms': 770,
#   'recommended_crossfade_ms': 616,
#   'silence_regions': [(0.0, 0.45), (180.2, 180.52)],
#   'has_significant_gaps': True
# }

# Just calculate crossfade between two tracks
crossfade = GapDetectionService.calculate_optimal_crossfade(
    current_track_trailing_silence_ms=500,
    next_track_leading_silence_ms=300
)
# Returns: 640 (milliseconds)
```

## Migration

Run the migration script to add columns to existing database:
```bash
python migrate_add_gap_detection.py
```

Then re-scan your library to populate silence data:
```bash
# The scanner will automatically detect gaps during metadata extraction
```

## Performance Considerations

- Gap detection runs during metadata extraction (parallel with other operations)
- Only processes tracks >30 seconds to avoid false positives
- FFmpeg silencedetect is efficient (~1-2 seconds per typical track)
- Results are cached in database - no re-analysis needed unless track changes

## Configuration

Adjust sensitivity in `gap_detection.py`:
```python
SILENCE_THRESHOLD_DB = -50  # Lower = more sensitive (detects quieter silence)
MIN_SILENCE_DURATION_MS = 100  # Minimum silence to detect
```

## Benefits

✅ **Smoother transitions** - Crossfade through actual silence, not audio content
✅ **No manual adjustment** - Automatic per-transition optimization
✅ **Respects album pacing** - Preserves intentional gaps between movements
✅ **Better than fixed crossfade** - Adapts to each track pair
✅ **Backwards compatible** - Falls back to user's default when no data available

## Files Modified/Created

- **NEW**: `gap_detection.py` - Core silence detection service
- **NEW**: `migrate_add_gap_detection.py` - Database migration script
- **MODIFIED**: `models.py` - Added gap detection fields to Track and QueueItem
- **MODIFIED**: `services.py` - Integrated gap detection into metadata extraction
- **MODIFIED**: `routes_minimal.py` - Updated queue endpoints to return/use dynamic crossfade
- **NEW**: `test_gap_detection.py` - Test suite for validation
