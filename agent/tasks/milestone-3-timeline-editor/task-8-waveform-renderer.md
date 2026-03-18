# Task 8: Waveform Renderer

**Milestone**: [M3 - Timeline Editor](../milestones/milestone-3-timeline-editor.md)
**Design Reference**: [Timeline Editor](../design/local.timeline-editor.md)
**Estimated Time**: 3 hours
**Dependencies**: Task 7 (TimelineEditor Component)
**Status**: Not Started

---

## Objective

Extract audio waveform data from a video file using the Web Audio API and render it as a canvas-based visualization inside the TimelineEditor component.

---

## Context

The timeline editor design shows an audio waveform behind the clip bar as the primary visual representation of the media. Users rely on waveform peaks/valleys to identify speech, silence, and music sections when setting trim points. This task adds waveform extraction and rendering, replacing the placeholder gradient background.

---

## Steps

### 1. Create Waveform Extraction Utility

Create `src/lib/waveform.ts`:

```typescript
export async function extractWaveform(
  file: File,
  sampleCount: number = 200
): Promise<number[]> {
  // Decode audio from video file using OfflineAudioContext
  // Downsample to sampleCount peaks
  // Return normalized array of amplitudes (0-1)
}
```

Implementation:
- Read file as ArrayBuffer
- Create `AudioContext` and decode audio data
- Get channel data from decoded AudioBuffer
- Divide samples into `sampleCount` buckets
- For each bucket, find peak absolute value
- Normalize all peaks to 0-1 range

### 2. Create Waveform Canvas Component

Create waveform rendering inside TimelineEditor (or as a sub-component):
- Render a `<canvas>` element filling the clip bar
- Draw vertical bars for each sample, centered vertically
- Bar height proportional to amplitude value
- Color: semi-transparent white or gray (`rgba(255, 255, 255, 0.3)`)

### 3. Handle Resize

- Use `ResizeObserver` on the canvas container
- Re-render waveform when container width changes
- Canvas resolution should match device pixel ratio for crisp rendering

### 4. Loading State

- While waveform is being extracted, show a subtle pulse animation or flat line
- Extraction happens async after file is loaded
- Cache waveform data per file to avoid re-extraction

---

## Verification

- [ ] `extractWaveform` returns normalized amplitude array from video file
- [ ] Waveform renders as vertical bars in the TimelineEditor background
- [ ] Canvas resolution is crisp on high-DPI displays
- [ ] Waveform re-renders on container resize
- [ ] Loading state shown during extraction
- [ ] Works with common video formats (mp4, webm)
- [ ] Handles videos with no audio track gracefully (flat line)

---

## Expected Output

**File Structure**:
```
src/
├── lib/
│   └── waveform.ts
└── components/
    └── TimelineEditor.tsx (updated with canvas waveform)
```

---

## Notes

- `OfflineAudioContext` is more reliable than `AnalyserNode` for full-file waveform extraction
- Safari may require user interaction before AudioContext creation — defer extraction to after first user action (file select)
- For very long videos, consider web worker extraction to avoid blocking UI
- 200 samples is a good default — enough detail for a ~400px wide timeline

---

**Next Task**: [Task 9: Editor Integration](task-9-editor-integration.md)
**Related Design Docs**: [Timeline Editor Design](../design/local.timeline-editor.md)
