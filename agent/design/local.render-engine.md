# Render Engine

**Concept**: Canvas 2D compositor that renders multi-layer timeline clips with per-clip audio mixing via Web Audio API
**Created**: 2026-03-18
**Status**: Design Specification

---

## Overview

The render engine replaces the current single `<video>` element approach with a Canvas 2D compositor backed by per-clip hidden `<video>` decoders and Web Audio API for audio mixing. It is the core module that makes the editor a real video editor — the preview canvas shows the composited result of all timeline clips at any given time, not just a raw video file.

---

## Problem Statement

The current editor renders a single `<video>` element with seek-based mapping through clips. This has fundamental limitations:

- **No compositing**: only one clip visible at a time, no multi-layer support
- **Stutter at cuts**: seeking between clips causes visible pauses
- **No audio mixing**: only one audio source at a time
- **No gap handling**: empty timeline regions show stale frames
- **Tightly coupled**: playback logic is scattered across React state in editor.tsx

---

## Solution

A standalone render engine module (`src/lib/render-engine.ts`) that:

1. Manages a pool of hidden `<video>` elements (one per clip)
2. Routes each clip's audio through Web Audio API `GainNode` for per-clip volume
3. Composites active clips onto a `<canvas>` using Canvas 2D `drawImage` in track order
4. Drives playback via `requestVideoFrameCallback` to match source frame rate
5. Renders black for gaps (no active clips at playhead position)
6. Provides a clean interface decoupled from React: `renderFrame`, `startPlayback`, `stopPlayback`, `seekTo`, `destroy`

### Alternative Approaches Considered

1. **WebGL compositor** — Rejected for MVP. Canvas 2D `drawImage(video)` is GPU-accelerated and sufficient for multi-layer compositing without effects. WebGL adds shader complexity without benefit until M5 (effects pipeline).

2. **ffmpeg.wasm frame decode** — Rejected for real-time preview. WASM decode is too slow for frame-by-frame playback on mobile. Browser's native `<video>` decoder is hardware-accelerated.

3. **Single `<video>` with seek mapping** (current approach) — Rejected. Cannot composite multiple layers, stutters at cuts, no audio mixing.

---

## Implementation

### Clip Interface

```typescript
interface Clip {
  id: string
  trackIndex: number
  startTime: number      // position on timeline (seconds)
  duration: number        // visible duration (seconds)
  sourceOffset: number    // offset into source media (seconds)
  sourceUrl: string       // URL of the source media file
  volume: number          // audio volume (0-1, default 1)
  color: string           // visual color for timeline UI
}
```

### Render Engine Interface

```typescript
interface RenderEngine {
  /** Draw a single frame at the given timeline time (for seeking/scrubbing) */
  renderFrame(timelineTime: number): void

  /** Start continuous playback from the given timeline time */
  startPlayback(fromTime: number): void

  /** Stop playback */
  stopPlayback(): void

  /** Seek to a timeline time (updates video elements, draws frame) */
  seekTo(timelineTime: number): void

  /** Update the clip list (called when clips change) */
  setClips(clips: Clip[]): void

  /** Get current timeline time during playback */
  getCurrentTime(): number

  /** Register a callback for timeline time updates during playback */
  onTimeUpdate(callback: (timelineTime: number) => void): void

  /** Cleanup all video elements and audio nodes */
  destroy(): void
}
```

### Architecture

```
┌──────────────────────────────────────────────────────┐
│ React (editor.tsx)                                    │
│  - owns clips[] state                                │
│  - calls engine.setClips() on changes                │
│  - calls engine.seekTo() on playhead drag            │
│  - calls engine.startPlayback() / stopPlayback()     │
│  - listens to engine.onTimeUpdate() for playhead pos │
└──────────┬───────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────┐
│ RenderEngine (src/lib/render-engine.ts)               │
│                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │ ClipDecoder  │  │ ClipDecoder  │  │ ClipDecoder  │  │
│  │ <video>      │  │ <video>      │  │ <video>      │  │
│  │ GainNode     │  │ GainNode     │  │ GainNode     │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                 │          │
│         ▼                 ▼                 ▼          │
│  ┌─────────────────────────────────────────────────┐  │
│  │ AudioContext → merged output → speakers          │  │
│  └─────────────────────────────────────────────────┘  │
│                                                       │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Canvas 2D compositor                             │  │
│  │  1. clearRect (black)                            │  │
│  │  2. for each active clip (track order, low→high) │  │
│  │     drawImage(clip.videoElement, 0, 0, w, h)    │  │
│  └─────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### ClipDecoder (internal)

Each clip gets a `ClipDecoder` that manages its `<video>` element and audio routing:

```typescript
class ClipDecoder {
  readonly video: HTMLVideoElement
  readonly gainNode: GainNode
  private source: MediaElementAudioSourceNode

  constructor(clip: Clip, audioContext: AudioContext) {
    this.video = document.createElement('video')
    this.video.src = clip.sourceUrl
    this.video.preload = 'auto'
    this.video.muted = true  // audio routed through Web Audio API
    this.video.playsInline = true

    this.source = audioContext.createMediaElementSource(this.video)
    this.gainNode = audioContext.createGain()
    this.gainNode.gain.value = clip.volume
    this.source.connect(this.gainNode)
    this.gainNode.connect(audioContext.destination)
  }

  seekTo(sourceTime: number) {
    this.video.currentTime = sourceTime
  }

  setVolume(volume: number) {
    this.gainNode.gain.value = volume
  }

  destroy() {
    this.video.pause()
    this.video.removeAttribute('src')
    this.video.load()
    this.source.disconnect()
    this.gainNode.disconnect()
  }
}
```

### Compositing (per frame)

```typescript
renderFrame(timelineTime: number) {
  const ctx = this.canvas.getContext('2d')!
  const w = this.canvas.width
  const h = this.canvas.height

  // Black background (gap rendering)
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, w, h)

  // Find all active clips at this time, sorted by track (low = back)
  const active = this.clips
    .filter(c => timelineTime >= c.startTime && timelineTime < c.startTime + c.duration)
    .sort((a, b) => a.trackIndex - b.trackIndex)

  // Draw each active clip's frame
  for (const clip of active) {
    const decoder = this.decoders.get(clip.id)
    if (decoder && decoder.video.readyState >= 2) {
      ctx.drawImage(decoder.video, 0, 0, w, h)
    }
  }
}
```

### Playback Loop

```typescript
startPlayback(fromTime: number) {
  this.timelineTime = fromTime
  this.lastTimestamp = performance.now()

  // Start all active clip decoders playing
  for (const clip of this.clips) {
    const decoder = this.decoders.get(clip.id)
    if (decoder) {
      const sourceTime = clip.sourceOffset + Math.max(0, fromTime - clip.startTime)
      decoder.video.currentTime = sourceTime
      decoder.video.play()
    }
  }

  // Use RAF for compositing
  const tick = (timestamp: number) => {
    const delta = (timestamp - this.lastTimestamp) / 1000
    this.lastTimestamp = timestamp
    this.timelineTime += delta

    this.renderFrame(this.timelineTime)
    this.timeUpdateCallback?.(this.timelineTime)

    // Check if any clips remain
    const maxEnd = Math.max(...this.clips.map(c => c.startTime + c.duration))
    if (this.timelineTime < maxEnd) {
      this.rafId = requestAnimationFrame(tick)
    } else {
      this.stopPlayback()
    }
  }

  this.rafId = requestAnimationFrame(tick)
}
```

### Seeking

```typescript
seekTo(timelineTime: number) {
  this.timelineTime = timelineTime

  // Seek each clip's decoder to the correct source position
  for (const clip of this.clips) {
    const decoder = this.decoders.get(clip.id)
    if (!decoder) continue

    if (timelineTime >= clip.startTime && timelineTime < clip.startTime + clip.duration) {
      const sourceTime = clip.sourceOffset + (timelineTime - clip.startTime)
      decoder.seekTo(sourceTime)
    }
  }

  this.renderFrame(timelineTime)
}
```

---

## Benefits

- **True compositing**: multiple clips visible simultaneously, layered by track order
- **Seamless cuts**: no stutter at clip boundaries (per-clip decoders run independently)
- **Audio mixing**: per-clip volume control via Web Audio API GainNodes
- **Gap rendering**: black frames when no clips are active
- **Decoupled**: render engine is a standalone module, editor.tsx just calls the interface
- **Extensible**: Canvas 2D can be replaced with WebGL for effects in M5

---

## Trade-offs

- **Memory**: one `<video>` element per clip consumes memory and decoder resources. On mobile Safari, limited to ~4-8 concurrent media elements. Mitigation: virtualize decoders for clips far from playhead in a future pass.
- **Complexity**: significantly more complex than the current single-`<video>` approach. Mitigation: clean interface boundary means editor.tsx gets simpler.
- **Audio latency**: `createMediaElementSource()` can only be called once per `<video>`, must be set up at decoder creation. Mitigation: create audio routing at ClipDecoder construction time.
- **Seeking accuracy**: `<video>` element seeks to nearest keyframe. For frame-exact seeking, WebCodecs is needed as progressive enhancement (Chromium only). Mitigation: `requestVideoFrameCallback` provides accurate frame timing for playback; seeking accuracy is "good enough" for MVP.

---

## Dependencies

- Canvas 2D API (universal browser support)
- Web Audio API (universal browser support)
- `requestVideoFrameCallback` (Safari 15.4+, Chrome 83+, Firefox 132+)
- WebCodecs API (progressive enhancement, Chromium only)

---

## Testing Strategy

- **Unit**: `renderFrame` with mock video elements — verify draw order, gap handling
- **Integration**: create engine with real video sources, verify frame output matches expected compositing
- **Audio**: verify per-clip volume changes affect output, verify simultaneous playback
- **Performance**: measure frame draw time with 1, 2, 4 clips on mobile Safari
- **Edge cases**: empty timeline, single clip, overlapping clips, clip at time 0, clip extending past timeline end

---

## Migration Path

1. Create `src/lib/render-engine.ts` with the `RenderEngine` class
2. Add `sourceUrl` and `volume` fields to `Clip` interface in `TimelineEditor.tsx`
3. Replace the `<video>` element in editor.tsx with a `<canvas>` element
4. Wire editor.tsx to use `RenderEngine` instead of direct video manipulation
5. Remove all seek-based clip mapping logic from editor.tsx (now in render engine)
6. Update upload flow to store source URLs per clip

---

## Key Design Decisions

### Rendering

| Decision | Choice | Rationale |
|---|---|---|
| Compositing surface | Canvas 2D | GPU-accelerated `drawImage`, simpler than WebGL, sufficient without effects |
| Decoder strategy | One `<video>` per clip | Clips can be duplicated, need independent seek positions |
| Frame rate | Match source via `requestVideoFrameCallback` | Native frame cadence, no duplicate draws |

### Compositing

| Decision | Choice | Rationale |
|---|---|---|
| Layer priority | Higher track index = foreground | Matches Photoshop/After Effects layer model |
| Overlap behavior | Composite all active clips | Draw in track order, opaque for MVP |
| Gaps | Black | Clear to user that nothing is there |
| Transitions | Hard cut only (MVP) | User-applied transitions are future scope |

### Audio

| Decision | Choice | Rationale |
|---|---|---|
| Mixing | Web Audio API | Per-clip volume control is MVP; `GainNode` per clip |
| Overlap | All active clips play simultaneously | Standard NLE behavior |

### Architecture

| Decision | Choice | Rationale |
|---|---|---|
| Module | Standalone `src/lib/render-engine.ts` | Decoupled from React state, testable |
| Interface | `renderFrame`, `startPlayback`, `stopPlayback`, `seekTo`, `destroy` | Clean boundary, editor.tsx stays simple |

---

## Future Considerations

- **WebGL migration**: Replace Canvas 2D with WebGL for M5 effects pipeline (shaders for color grading, blur, transitions)
- **Decoder virtualization**: Only create `<video>` elements for clips near the playhead (mobile memory limits)
- **WebCodecs**: Progressive enhancement for frame-exact seeking on Chromium
- **Thumbnail strip**: Render frame thumbnails along clip blocks in the timeline
- **Export**: Render engine's compositing logic can be reused for server-side export (with headless canvas / ffmpeg pipeline)

---

**Status**: Design Specification
**Recommendation**: Implement as `src/lib/render-engine.ts`, then wire into editor.tsx replacing the current video element approach
**Related Documents**:
- `agent/clarifications/clarification-1-render-engine-architecture.md` (source clarification)
- `agent/design/requirements.md` (project requirements)
- `agent/design/local.timeline-editor.md` (timeline UI design)
