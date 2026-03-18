# Timeline Editor

**Concept**: Touch-optimized video timeline with playhead scrubber, in/out trim handles, and audio waveform visualization
**Created**: 2026-03-18
**Status**: Design Specification

---

## Overview

This design describes the core timeline editor component for CloudCut — a horizontal clip bar with three interactive markers layered over an audio waveform. The interaction model is optimized for touch devices (mobile-first) while remaining usable with mouse input on desktop.

The design separates playhead scrubbing (top edge) from trim selection (bottom edge) to prevent accidental activation of the wrong control, following patterns established by CapCut, iMovie, and other mobile NLEs.

---

## Problem Statement

- Users need to preview video at arbitrary positions (scrubbing) AND select a sub-region for trimming — two distinct operations on the same timeline.
- On touch devices, fat-finger collisions between playhead and trim handles cause frustrating mis-drags.
- Without clear visual differentiation, users confuse which handle does what.

---

## Solution

Three vertical markers on a horizontal clip bar, each with a distinct touch zone:

### Marker Anatomy

```
                    ◇  ← diamond handle (playhead, top edge)
                    │
  ○─────────────────┼──────────────○  ← clip bar with waveform
  │                 │              │
  ●                 │              ●  ← circle handles (in/out, bottom edge)
```

1. **Playhead** — diamond (◇) handle anchored to the **top edge** of the clip bar
   - Vertical line spans the full clip height
   - Moves with video playback in real-time
   - User drags from the diamond to scrub to any frame
   - Touch activation zone: top ~30% of clip bar height

2. **In-point handle** — circle (●) anchored to the **bottom-left** of the clip bar
   - Vertical line spans the full clip height
   - User drags from the circle to set trim start
   - Touch activation zone: bottom ~30% of clip bar height
   - Constrained: cannot pass the out-point handle

3. **Out-point handle** — circle (●) anchored to the **bottom-right** of the clip bar
   - Same behavior as in-point, but sets trim end
   - Constrained: cannot pass the in-point handle

### Visual Indicators

- **Selected region**: area between in/out handles is visually highlighted (lighter/colored overlay)
- **Unselected region**: area outside in/out handles is dimmed (dark overlay or reduced opacity)
- **Waveform**: audio waveform rendered as the clip bar background across the full duration
- **Active handle**: subtle scale-up or glow when a handle is being dragged

### Touch Zone Separation

The clip bar is divided vertically into three zones:
- **Top zone (~30%)**: activates playhead drag only
- **Middle zone (~40%)**: no drag activation (passive — shows waveform, allows tap-to-seek)
- **Bottom zone (~30%)**: activates nearest in/out handle drag

This prevents accidental cross-activation between playhead and trim handles.

---

## Implementation

### Component Structure

```typescript
interface TimelineEditorProps {
  videoRef: React.RefObject<HTMLVideoElement>
  duration: number          // total video duration in seconds
  waveformData?: number[]   // normalized audio amplitude samples (0-1)
}

interface TimelineState {
  playheadPosition: number  // 0-1 normalized position
  inPoint: number           // 0-1 normalized position (default: 0)
  outPoint: number          // 0-1 normalized position (default: 1)
  activeHandle: 'playhead' | 'in' | 'out' | null
  isPlaying: boolean
}
```

### Key Behaviors

- **Playback sync**: playhead position updates via `requestAnimationFrame` during playback, reading `video.currentTime / video.duration`
- **Drag handling**: uses `pointerdown` / `pointermove` / `pointerup` events (unified touch + mouse)
- **Hit detection**: on `pointerdown`, check Y-coordinate relative to clip bar to determine which zone was touched, then check X-proximity to determine which handle (for in/out zone)
- **Snapping**: optional frame-snapping by quantizing position to `1 / (fps * duration)` increments
- **Seek on scrub**: when playhead is dragged, update `video.currentTime` in real-time for live preview

### CSS Layout

```
┌─────────────────────────────────────────────┐
│ [◇]                                         │  ← handle row (absolute positioned)
│                                             │
│ ░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░ │  ← waveform + selection overlay
│                                             │
│ [●]                            [●]          │  ← handle row (absolute positioned)
└─────────────────────────────────────────────┘
  ░ = dimmed (outside selection)
  ▓ = highlighted (inside selection)
```

The component is a single `div` with `position: relative`. Handles, waveform, and overlays are absolutely positioned children.

### Waveform Rendering

- Render waveform as a `<canvas>` element filling the clip bar
- Draw vertical bars for each sample, height proportional to amplitude
- Re-render only when waveform data changes or container resizes
- For MVP: generate waveform data client-side using Web Audio API (`AnalyserNode` or `OfflineAudioContext`)

---

## Benefits

- **Touch-friendly**: separated touch zones prevent mis-drags on mobile
- **Familiar pattern**: matches mental model from CapCut, iMovie, and other NLEs
- **Visual clarity**: diamond vs circle handles instantly communicate different functions
- **Responsive**: pointer events work uniformly across touch and mouse
- **Performant**: canvas waveform + RAF playhead sync avoids layout thrashing

---

## Trade-offs

- **Vertical space**: requires sufficient clip bar height (~80-100px) to create meaningful top/middle/bottom zones. On very small screens, zones may feel cramped.
- **Waveform generation**: computing waveform client-side adds processing time on video load. Mitigated by showing a placeholder bar until waveform is ready.
- **No pinch-to-zoom**: this design covers a fixed-zoom timeline. Horizontal zoom/scroll is a future enhancement.

---

## Dependencies

- HTML5 `<video>` element for playback and seeking
- Web Audio API for waveform extraction (MVP)
- Pointer Events API (widely supported)
- `requestAnimationFrame` for playhead sync

---

## Testing Strategy

- **Unit tests**: handle constraint logic (in cannot pass out, out cannot pass in), position normalization, zone hit detection
- **Integration tests**: drag a handle → verify `video.currentTime` updates, play video → verify playhead moves
- **Touch simulation**: test with touch events to verify zone separation works (e.g., touch bottom zone doesn't activate playhead)
- **Edge cases**: video duration = 0, in/out at same position, rapid drag past boundaries

---

## Future Considerations

- **Pinch-to-zoom**: horizontal zoom with scroll for frame-precise editing on long videos
- **Multiple clips**: extend timeline to support multiple clips on a track
- **Thumbnail strip**: render video frame thumbnails behind the waveform for visual context
- **Keyboard shortcuts**: left/right arrow for frame stepping, I/O keys for in/out points
- **Haptic feedback**: vibrate on handle snap or boundary hit (mobile)

---

**Status**: Design Specification
**Recommendation**: Implement as a React component in `src/components/TimelineEditor.tsx`, replacing the current button-based trim controls in the editor route.
**Related Documents**: Editor route (`src/routes/editor.tsx`), ffmpeg trim logic (`src/lib/ffmpeg.ts`)
