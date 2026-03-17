# Task 9: Clip Operations

## Objective

Implement trim, split, reorder, and delete operations on clips, plus drag-and-drop between tracks, with all operations updating the EDL state.

## Context

This is what makes the timeline interactive. Each operation mutates the EDL and the timeline re-renders to reflect the change. Operations should be pure functions on the EDL state to simplify undo/redo (which comes in a later milestone). All mutations go through a central dispatch so state updates are predictable.

## Steps

1. Create an EDL state manager (`app/lib/edl/state.ts`) using React context + useReducer (or Zustand) with actions:
   - `TRIM_CLIP`: adjust a clip's inPoint/outPoint and duration by a delta
   - `SPLIT_CLIP`: split a clip at a given time into two adjacent clips
   - `MOVE_CLIP`: change a clip's startTime (reorder within track)
   - `MOVE_CLIP_TO_TRACK`: move a clip from one track to another
   - `DELETE_CLIP`: remove a clip from its track
2. Implement trim handles on `ClipBlock`:
   - Left and right edge drag handles that adjust in/out points
   - Snap the trimmed edge to prevent overlap with adjacent clips
   - Show a tooltip with the new in/out time during drag
3. Implement split at playhead:
   - Keyboard shortcut (e.g., `S` or `Cmd+B`) splits the clip under the playhead
   - Produces two clips: one ending at the playhead, one starting at it
4. Implement drag-and-drop for clips:
   - Horizontal drag to reposition within the same track
   - Vertical drag to move between tracks
   - Show a ghost preview during drag
   - Snap to other clip edges and playhead during drag
5. Implement delete:
   - Select a clip (click), press `Delete` or `Backspace` to remove it
   - Support multi-select (Shift+click) and batch delete
6. Ensure all operations update the EDL through the state manager and the timeline re-renders correctly.
7. Add basic collision detection: prevent clips from overlapping on the same track.

## Verification

- [ ] Dragging a clip's left/right edge trims it and updates duration display
- [ ] Trimming does not cause overlap with adjacent clips
- [ ] Splitting at the playhead produces two clips with correct in/out points
- [ ] Dragging a clip horizontally repositions it on the timeline
- [ ] Dragging a clip vertically moves it to another track
- [ ] Deleting a selected clip removes it from the timeline and the EDL
- [ ] Multi-select and batch delete works
- [ ] All operations are reflected in the serialized EDL state (inspect via dev tools or debug panel)
