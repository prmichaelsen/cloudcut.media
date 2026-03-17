# Task 25: Caption editor

## Objective
UI for reviewing and editing generated captions before adding to timeline.

## Context
AI captions have errors that need manual correction. Provide editor with playback sync so users can review and fix caption text, timing, and formatting while watching the video.

## Steps

1. **Create caption editor panel with list of caption segments**
   - Build dedicated editor UI showing all caption segments
   - Display timecode and text for each segment
   - Support scrolling for long caption lists
   - Highlight current segment during playback

2. **Add edit controls (split segment, merge segments, adjust timing)**
   - Text editing: inline text field for each segment
   - Split segment: divide one segment into two at cursor position
   - Merge segments: combine adjacent segments
   - Timing adjustment: drag handles or input fields for start/end times

3. **Sync editor with video preview**
   - Click caption segment to seek video to that timestamp
   - Highlight active caption during playback
   - Auto-scroll caption list to keep active segment visible
   - Add play/pause controls in editor

4. **Add spell check**
   - Integrate browser spell check for text fields
   - Highlight misspelled words
   - Provide suggestions for corrections
   - Support common video terminology

5. **Export as WebVTT or SRT**
   - Implement WebVTT export with proper formatting
   - Implement SRT export as alternative format
   - Add download button with format selection
   - Validate output format before export

6. **Add "Apply to Timeline" button to import edited captions**
   - Convert edited captions to timeline text overlay track
   - Replace any existing auto-generated captions
   - Position captions at bottom center by default
   - Preserve all timing adjustments

## Verification

- [ ] Caption editor opens with list of all caption segments
- [ ] User can edit caption text inline
- [ ] User can split segments into multiple captions
- [ ] User can merge adjacent segments
- [ ] User can adjust start/end timing for each segment
- [ ] Clicking a caption seeks video to that timestamp
- [ ] Active caption is highlighted during playback
- [ ] Editor auto-scrolls to keep active caption visible
- [ ] Spell check identifies misspelled words
- [ ] Export to WebVTT produces valid file format
- [ ] Export to SRT produces valid file format
- [ ] "Apply to Timeline" imports edited captions correctly
- [ ] Timeline captions match editor timing and text exactly

## Estimated Time
5 hours
