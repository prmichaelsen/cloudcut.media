# Task 8: Timeline UI

## Objective

Build a multi-track timeline component with a time ruler, track lanes, clip blocks, and zoom/scroll controls.

## Context

The timeline is the primary editing surface. It renders the EDL visually: each track is a horizontal lane, each clip is a block positioned and sized according to its start time and duration. The user needs to zoom in/out and scroll horizontally to navigate long timelines. This task is read-only rendering -- interactive clip operations come in Task 9.

## Steps

1. Create a `Timeline` component (`app/components/timeline/Timeline.tsx`) that accepts an EDL `Project` as a prop and renders:
   - A time ruler along the top showing timecodes (HH:MM:SS:FF)
   - A vertical track list on the left with track names and controls (mute, lock, visibility toggles)
   - A scrollable clip area where each track is a horizontal lane
2. Create a `ClipBlock` component that renders a single clip as a colored rectangle:
   - Width proportional to clip duration at the current zoom level
   - Positioned horizontally based on `startTime`
   - Shows a thumbnail or waveform placeholder and the clip/asset name
   - Different colors per track type (video, audio, title)
3. Implement horizontal zoom:
   - Zoom control (slider or +/- buttons) adjusts pixels-per-second
   - Zoom toward the cursor or playhead position
   - Min/max zoom bounds
4. Implement horizontal scroll (synced between ruler and clip area) and vertical scroll for many tracks.
5. Add a playhead indicator (vertical line) that can be positioned by clicking on the ruler.
6. Wire the Timeline into the `/editor` route with a hardcoded sample EDL for visual testing.
7. Style with Tailwind: dark theme, clear visual separation between tracks, subtle grid lines.

## Verification

- [ ] Timeline renders tracks and clips from a sample EDL
- [ ] Time ruler shows correct timecodes and aligns with clip positions
- [ ] Zooming in/out changes the horizontal scale and clips resize accordingly
- [ ] Horizontal scroll works and keeps the ruler and clip area in sync
- [ ] Playhead appears at the clicked position on the ruler
- [ ] Different track types have visually distinct clip colors
- [ ] Layout handles 5+ tracks and 20+ clips without visible performance issues
