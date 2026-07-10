# Smart Queueing System

## Overview

The Smart Queueing system provides intelligent, contextual music recommendations that adapt to user behavior patterns, time of day, and listening preferences. Unlike static playlists, this system dynamically generates queues based on sophisticated analysis of user interactions.

## Key Features

### 1. User Behavior Analysis
- **Skip Rate Analysis**: Tracks and learns from skip patterns to avoid disliked content
- **Play Completion Scoring**: Rewards tracks played to completion, penalizes early skips
- **Time-based Preferences**: Learns when users prefer different types of music
- **Love/Hate Feedback**: Direct user input influences future recommendations

### 2. Contextual Recommendations
- **Time-of-Day Awareness**: Morning (energetic), Afternoon (balanced), Evening (relaxed), Night (calm)
- **Mood Transitions**: Smooth progression between compatible moods
- **Current Track Matching**: Recommendations complement the currently playing track
- **Recent Listening Trends**: Incorporates recent music discovery patterns

### 3. Dynamic Queue Adaptation
- **Diversity Filtering**: Prevents over-repetition of genres, artists, and moods
- **Energy Level Balancing**: Maintains variety in song energy levels
- **Confidence Scoring**: Rates recommendation quality
- **Real-time Learning**: Updates preferences based on user actions

### 4. Advanced API Endpoints

#### Basic Contextual Queue
```http
POST /queue/contextual
{
  "current_track_id": 123,
  "queue_size": 20,
  "context": {"activity": "workout"}
}
```

#### Advanced Contextual Queue
```http
POST /queue/contextual/advanced
{
  "current_track_id": 123,
  "queue_size": 20,
  "mood_preference": "energetic",
  "energy_preference": "high",
  "diversity_level": "high",
  "include_explanations": true
}
```

#### Feedback Recording
```http
POST /queue/feedback
{
  "track_id": 456,
  "action": "skip",
  "position": 15.5,
  "duration": 180.0
}
```

## Technical Implementation

### Scoring Algorithm

Tracks are scored based on multiple weighted factors:

1. **User Preference** (0.4 weight)
   - Love score from direct feedback
   - Play count with diminishing returns
   - Skip penalties

2. **Time Context** (0.2 weight)
   - User-specific time preferences
   - General time-of-day defaults

3. **Mood Compatibility** (0.2 weight)
   - Transition matrix compatibility
   - Current mood matching
   - Avoided mood penalties

4. **Audio Features** (0.15 weight)
   - Energy/tempo matching
   - Valence alignment
   - Recent trend matching

5. **Genre Variety** (0.05 weight)
   - Recent genre balancing
   - Skip rate by genre

### Mood Transition Matrix

The system uses a compatibility matrix for smooth listening experiences:

```
From → To | Energetic | Happy | Relaxed | Focused | Melancholic
Energetic |   0.9     |  0.7  |   0.3   |   0.2   |    0.1
Happy     |   0.6     |  0.8  |   0.8   |   0.4   |    0.2
Relaxed   |   0.2     |  0.7  |   0.9   |   0.6   |    0.5
Focused   |   0.3     |  0.5  |   0.7   |   0.9   |    0.3
Melancholic|  0.2     |  0.4  |   0.7   |   0.5   |    0.8
```

### Time-Based Preferences

Default preferences by time period:

- **Morning (6-12)**: High energy (0.7), 120 BPM, Neutral valence
- **Afternoon (12-18)**: Medium energy (0.6), 110 BPM, Positive valence
- **Evening (18-22)**: Low energy (0.4), 90 BPM, Positive valence
- **Night (22-6)**: Low energy (0.3), 80 BPM, Neutral valence

### Diversity Controls

The system maintains balance through dynamic constraints:
- **Genre**: Max 25% of same genre
- **Mood**: Max 30% of same mood
- **Artist**: Max 15% of same artist
- **Energy**: Max 40% of same energy level

## Usage Examples

### Getting Recommendations
```python
recommendations = await contextual_queue.get_contextual_recommendations(
    user_id=1,
    current_track_id=123,
    queue_size=20
)
```

### Recording User Feedback
```python
await contextual_queue.update_user_preferences(
    user_id=1,
    track_id=456,
    action="love"  # or "skip", "play", "hate"
)
```

### Advanced Context
```python
context = {
    "time_of_day": "afternoon",
    "activity": "commuting",
    "weather": "sunny"
}
```

## Integration Points

- **User Play Stats**: Leverages existing UserPlayStats table for behavior analysis
- **Audio Features**: Uses AudioFeatures table for music analysis
- **Analytics Service**: Integrates with existing analytics for pattern recognition
- **Real-time Updates**: Updates preferences on every user action

## Performance Optimizations

- Batch database queries for audio features
- Efficient numpy operations for scoring calculations
- Caching of user preference patterns
- Optimized diversity filtering algorithms

## Future Enhancements

- Weather-based recommendations
- Location-aware preferences
- Social listening patterns
- Collaborative filtering
- Machine learning model integration