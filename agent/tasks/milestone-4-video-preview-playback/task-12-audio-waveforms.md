# Task 12: Audio Waveforms

**Milestone**: [M4 - Video Preview & Playback](../../milestones/milestone-4-video-preview-playback.md)
**Dependencies**: Task 2 (ffmpeg.wasm), Task 7 (timeline data model)
**Status**: Not Started

## Objective

Extract audio waveform data from imported media and render it as a visual waveform on each timeline track, synchronized with the playback position.

## Context

Audio waveforms give editors essential visual feedback about dialogue, music, and sound effects without needing to play back the audio. The waveform should render as a filled amplitude graph on the clip's timeline track, zoom and scroll with the timeline, and show a playhead position indicator that stays in sync with the preview player.

## Steps

### 1. Extract waveform data

- Use the Web Audio API's `OfflineAudioContext` and `AudioBuffer` to decode audio from imported media files
- Downsample the raw PCM data into peak bins (min/max pairs per bin) at a resolution suitable for the timeline zoom level (e.g., 1 bin per pixel)
- Store the waveform data in an IndexedDB cache keyed by media file hash
- Run extraction in a Web Worker to avoid blocking the UI

### 2. Build the waveform renderer

- Create a canvas-based waveform component that renders min/max peak bars
- Accept the peak data array, clip in/out points, and timeline zoom/scroll as props
- Render using `CanvasRenderingContext2D` for simplicity (upgrade to WebGL if performance requires)
- Style: filled waveform with a semi-transparent color per track, centered on the vertical midline

### 3. Integrate with timeline tracks

- Render the waveform canvas as a background layer within each clip on the timeline
- Clip the waveform to the clip's in/out trim points
- Re-bin the waveform data when the timeline zoom level changes (debounced)
- Handle clips with no audio track (show flat line or nothing)

### 4. Sync playhead with playback

- Draw a vertical line on the waveform at the current playback position
- Update the playhead position from the shared playback store (same store as Task 11)
- Highlight the region around the playhead during playback for visual emphasis (optional)

### 5. Audio playback

- Play audio through the Web Audio API in sync with the video playback loop
- Map the timeline position to the correct audio source and offset
- Handle mute/solo per track if track controls exist

## Verification

- [ ] Waveforms render for all imported media that contains an audio track
- [ ] Waveform shape visually matches the audio content (loud sections are taller)
- [ ] Zooming the timeline updates waveform resolution without visible lag
- [ ] Waveforms respect clip trim points (only show audio within in/out range)
- [ ] Playhead position on the waveform matches the preview player's current time
- [ ] Audio plays in sync with video during playback
- [ ] Waveform extraction does not block the UI thread
