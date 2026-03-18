# Task 7: TimelineEditor Component

**Milestone**: [M3 - Timeline Editor](../milestones/milestone-3-timeline-editor.md)
**Design Reference**: [Timeline Editor](../design/local.timeline-editor.md)
**Estimated Time**: 5 hours
**Dependencies**: None
**Status**: Not Started

---

## Objective

Create a reusable `TimelineEditor` React component that renders a horizontal clip bar with three draggable markers: a playhead (diamond handle, top edge) and in/out trim handles (circle handles, bottom edge). The component must support both touch and mouse input with separated activation zones.

---

## Context

The current editor uses button-based "Set In" / "Set Out" controls which require the user to play the video, pause at the right moment, then click a button. This is clumsy, especially on mobile. The TimelineEditor replaces this with a direct-manipulation scrubber matching the UX pattern from the design document (CapCut/iMovie-style).

---

## Steps

### 1. Create Component File

Create `src/components/TimelineEditor.tsx` with the following props interface:

```typescript
interface TimelineEditorProps {
  duration: number                    // total video duration in seconds
  currentTime: number                 // current playback position in seconds
  inPoint: number                     // trim start in seconds
  outPoint: number                    // trim end in seconds
  onSeek: (time: number) => void      // called when playhead is dragged
  onInPointChange: (time: number) => void
  onOutPointChange: (time: number) => void
  waveformData?: number[]             // normalized amplitude samples (0-1)
}
```

### 2. Implement Layout

Render a `div` with `position: relative` as the clip bar container (~80-100px height). Inside:
- Background: waveform canvas or placeholder gradient
- Selection overlay: highlighted region between in/out points
- Dimmed overlay: regions outside the selection
- Three handle elements (absolute positioned)

### 3. Implement Handle Rendering

Each handle is a vertical line spanning the clip bar height with a touch target:
- **Playhead**: diamond (◇) shape at top edge, vertical line
- **In-point**: circle (●) at bottom-left, vertical line
- **Out-point**: circle (●) at bottom-right, vertical line

Position each handle horizontally at `(time / duration) * containerWidth`.

### 4. Implement Pointer Event Drag System

Use `onPointerDown` on the container to determine which handle to activate:
- Check `e.clientY` relative to container bounds
- Top ~30%: activate playhead drag
- Bottom ~30%: activate nearest in/out handle (by X proximity)
- Middle ~40%: tap-to-seek (move playhead to tapped position)

On `pointermove` (attached to `window` during drag):
- Convert `e.clientX` to normalized position (0-1)
- Clamp to valid range
- Call the appropriate callback (`onSeek`, `onInPointChange`, `onOutPointChange`)

On `pointerup`: clear active handle.

### 5. Implement Handle Constraints

- In-point cannot exceed out-point (clamp to `outPoint - epsilon`)
- Out-point cannot go below in-point (clamp to `inPoint + epsilon`)
- All handles clamped to 0-duration range

### 6. Style with Tailwind

- Clip bar: `bg-gray-700 rounded-lg` with fixed height
- Selected region: `bg-blue-500/20` overlay
- Dimmed region: `bg-black/40` overlay
- Playhead line: `bg-white w-0.5`
- In/out lines: `bg-blue-400 w-0.5`
- Diamond handle: rotated square, white
- Circle handles: `rounded-full bg-blue-400 border-2 border-white`

---

## Verification

- [ ] Component renders a horizontal clip bar with correct height
- [ ] Playhead diamond appears at top edge, positioned by currentTime
- [ ] In/out circles appear at bottom edge, positioned by inPoint/outPoint
- [ ] Dragging from top zone moves playhead and calls onSeek
- [ ] Dragging from bottom zone moves nearest in/out handle
- [ ] Tapping middle zone moves playhead to tap position
- [ ] In-point cannot pass out-point and vice versa
- [ ] All handles clamp to 0-duration range
- [ ] Works with both mouse and touch input
- [ ] Selection region visually highlighted between in/out points

---

## Expected Output

**File Structure**:
```
src/
└── components/
    └── TimelineEditor.tsx
```

---

## Notes

- Use `setPointerCapture` for reliable cross-element drag tracking
- Use `touch-action: none` CSS to prevent browser scroll during drag
- Consider `will-change: transform` on handle elements for smooth animation
- The component is controlled (all state managed by parent)

---

**Next Task**: [Task 8: Waveform Renderer](task-8-waveform-renderer.md)
**Related Design Docs**: [Timeline Editor Design](../design/local.timeline-editor.md)
