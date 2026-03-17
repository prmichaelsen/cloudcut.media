# Task 23: Auto-captions

## Objective
Vertex AI Speech-to-Text integration for automatic subtitle generation.

## Context
Extract audio from video, send to Vertex AI, import WebVTT subtitle track to timeline. Users need automated captioning to save time on manual subtitle creation and improve video accessibility.

## Steps

1. **Extract audio from video to WAV using ffmpeg**
   - Use ffmpeg to extract audio track from uploaded video
   - Convert to WAV format (required by Vertex AI Speech-to-Text)
   - Handle videos with no audio track gracefully

2. **Upload to GCS temp bucket**
   - Create temporary GCS bucket for audio files
   - Upload extracted WAV file with unique identifier
   - Set appropriate lifecycle policy for automatic cleanup

3. **Call Vertex AI Speech-to-Text API with long-running job**
   - Configure Speech-to-Text API with appropriate model (video model recommended)
   - Enable word-level timestamps for accurate caption timing
   - Set language preference (default to auto-detect)

4. **Poll for completion, parse transcript with timestamps**
   - Implement polling mechanism with exponential backoff
   - Parse response to extract words, timestamps, and confidence scores
   - Handle API errors (quota exceeded, unsupported language, etc.)

5. **Generate WebVTT subtitle file**
   - Group words into caption segments (max 2 lines, ~5 seconds each)
   - Format as valid WebVTT with proper timestamps
   - Include confidence scores as metadata

6. **Import as text overlay track on timeline**
   - Create new subtitle track in timeline
   - Add caption segments as text overlays with timing
   - Position captions at bottom center by default

7. **Handle errors gracefully**
   - Display user-friendly error messages for common failures
   - Provide fallback options (manual caption upload, retry)
   - Log errors for debugging

## Verification

- [ ] User can initiate auto-caption generation from uploaded video
- [ ] Captions are generated and appear on timeline as text overlay track
- [ ] Caption timing syncs accurately with audio (>90% accuracy for clear speech)
- [ ] System handles videos with no audio track without crashing
- [ ] API failures display user-friendly error messages
- [ ] Unsupported languages are detected and reported to user
- [ ] Generated captions can be edited using caption editor (Task 25)
- [ ] Temporary audio files are cleaned up after processing

## Estimated Time
6 hours
