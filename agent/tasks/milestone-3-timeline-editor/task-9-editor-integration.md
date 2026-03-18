# Task 9: Editor Integration

**Milestone**: [M3 - Timeline Editor](../milestones/milestone-3-timeline-editor.md)
**Design Reference**: [Timeline Editor](../design/local.timeline-editor.md)
**Estimated Time**: 4 hours
**Dependencies**: Task 7 (TimelineEditor Component), Task 8 (Waveform Renderer)
**Status**: Not Started

---

## Objective

Replace the button-based trim controls in `src/routes/editor.tsx` with the TimelineEditor component. Wire the playhead to video seek, in/out handles to trim state, and connect the trim action to the existing ffmpeg.wasm pipeline.

---

## Context

The current editor has separate "Set In" and "Set Out" buttons that capture `video.currentTime` on click. This requires the user to play → pause → click a button, which is slow and imprecise. The TimelineEditor provides direct drag-to-scrub and drag-to-trim, which is the standard mobile video editing interaction.

---

## Steps

### 1. Add Waveform Extraction on File Load

After a file is selected and uploaded:
- Call `extractWaveform(file)` to generate waveform data
- Store in component state: `const [waveformData, setWaveformData] = useState<number[]>([])`
- Show the TimelineEditor as soon as the video is loaded (don't wait for waveform — it renders progressively)

### 2. Sync Video Playback with Playhead

- Use `requestAnimationFrame` loop during playback to read `videoRef.current.currentTime` and pass as `currentTime` prop
- When `onSeek` fires from playhead drag, set `videoRef.current.currentTime` to the new value
- Pause video during playhead drag for responsive scrubbing

### 3. Replace Trim Controls

Remove the entire "3. Trim Video" section (the grid with Set In / Set Out buttons and duration display). Replace with:

```tsx
<TimelineEditor
  duration={videoDuration}
  currentTime={currentTime}
  inPoint={inPoint}
  outPoint={outPoint}
  onSeek={handleSeek}
  onInPointChange={setInPoint}
  onOutPointChange={setOutPoint}
  waveformData={waveformData}
/>
```

### 4. Add Time Display

Below the TimelineEditor, show a compact info bar:
- Current position: `0:15`
- Selection: `0:03 → 0:42` (duration: `0:39`)
- Use the existing `formatTime` helper

### 5. Keep Trim + Download Actions

Keep the "Trim Video" and "Download" buttons below the timeline. They use the same `handleTrim` / `handleDownload` logic already in editor.tsx.

### 6. Remove Unused Imports

Remove `handleSetInPoint` and `handleSetOutPoint` handlers. Add `handleSeek` handler:

```typescript
const handleSeek = (time: number) => {
  if (videoRef.current) {
    videoRef.current.currentTime = time
  }
}
```

### 7. Hide Native Video Controls

Replace `controls` attribute on `<video>` with custom play/pause button, since the timeline now provides scrubbing. Or keep native controls for MVP and layer the timeline below.

---

## Verification

- [ ] TimelineEditor renders below the video player after upload
- [ ] Playhead moves in real-time during video playback
- [ ] Dragging playhead seeks the video to the correct position
- [ ] Dragging in/out handles updates trim selection
- [ ] Waveform renders in the timeline background
- [ ] Time display shows current position and selection range
- [ ] "Trim Video" button uses in/out handle positions
- [ ] Trimmed video downloads correctly
- [ ] Old button-based trim UI is fully removed
- [ ] No regressions in upload flow

---

## Expected Output

**Files Modified**:
- `src/routes/editor.tsx` — replaced trim section with TimelineEditor

**Visual Change**:
```
Before:                          After:
┌──────────────────┐            ┌──────────────────┐
│ Video Player     │            │ Video Player     │
├──────────────────┤            ├──────────────────┤
│ [Set In] [Set Out]│           │ ◇────────────    │
│ Duration: 0:39   │            │ ▓▓▓▓▓▓▓▓░░░░░   │
│ [Trim] [Download]│            │ ●──────────●     │
└──────────────────┘            │ 0:03 → 0:42 (39s)│
                                │ [Trim] [Download]│
                                └──────────────────┘
```

---

## Notes

- Keep the video `controls` attribute for MVP — users can still play/pause natively
- The `requestAnimationFrame` loop should be cleaned up on unmount
- Consider debouncing `onSeek` to avoid overwhelming video seeking on fast drags
- Test on mobile Safari — touch events and video seeking have quirks on iOS

---

**Related Design Docs**: [Timeline Editor Design](../design/local.timeline-editor.md)
