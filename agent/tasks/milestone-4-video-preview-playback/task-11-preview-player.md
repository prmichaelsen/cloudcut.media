# Task 11: Preview Player

**Milestone**: [M4 - Video Preview & Playback](../../milestones/milestone-4-video-preview-playback.md)
**Dependencies**: Task 10 (frame decoder)
**Status**: Not Started

## Objective

Build a canvas-based preview player component with play/pause/seek controls and frame-accurate scrubbing that stays in sync with the timeline editor.

## Context

The preview player is the primary feedback surface for the editor. It renders decoded frames to a canvas element, drives playback via `requestAnimationFrame`, and synchronizes its position with the timeline component from M3. The player must feel responsive during scrubbing and maintain smooth playback at the proxy resolution framerate.

## Steps

### 1. Create the player component

- Build a React component wrapping an HTML `<canvas>` element
- Size the canvas to the project resolution (scaled to fit the preview panel)
- Accept the timeline store as input for position, duration, and playback state

### 2. Implement the render loop

- On play: start a `requestAnimationFrame` loop that advances the timeline position at the project framerate
- Each frame: request the decoded frame from the FrameDecoder (Task 10) and draw it to the canvas via `drawImage`
- On pause: stop the RAF loop and hold the current frame
- Track actual vs expected frame times to detect and compensate for dropped frames

### 3. Add transport controls

- Play/pause toggle button
- Seek bar (or reuse timeline scrubber) for coarse navigation
- Frame-step forward/backward buttons (arrow keys)
- Keyboard shortcuts: Space (play/pause), J/K/L (reverse/pause/forward), Left/Right (frame step)

### 4. Sync with timeline

- Bidirectional sync: scrubbing the timeline updates the player; scrubbing the player updates the timeline
- Use a shared reactive store (Zustand or TanStack Store) for the current playback position
- Debounce rapid position changes during scrubbing to limit decode requests

### 5. Handle multi-track compositing

- When multiple video tracks overlap, composite them in z-order onto the canvas
- For now, upper tracks simply draw over lower tracks (alpha compositing comes in M5)

## Verification

- [ ] Pressing play renders smooth video at the proxy framerate (30fps target)
- [ ] Pausing freezes on the exact current frame
- [ ] Frame-step buttons advance exactly one frame forward or backward
- [ ] Scrubbing the timeline instantly updates the preview (within 100ms)
- [ ] Scrubbing the player's seek bar updates the timeline position
- [ ] Keyboard shortcuts work when the player or timeline is focused
- [ ] Player resizes correctly when the panel is resized
