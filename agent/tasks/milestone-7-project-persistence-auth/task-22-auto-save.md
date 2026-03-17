# Task 22: Auto-save

## Objective
Background auto-save every 30s with visual indicator.

## Context
Users lose work if they forget to save or browser crashes. Auto-save prevents data loss.

## Steps
1. Create useAutoSave hook with 30s debounced interval
2. Track "dirty" state (has unsaved changes since last save)
3. Save EDL to GCS automatically when dirty and interval elapsed
4. Add visual indicator in header: "Saving...", "All changes saved", "Offline (will sync)"
5. Handle save errors gracefully (retry with exponential backoff, show toast on failure)
6. Pause auto-save during active editing (user is dragging timeline, typing, etc.)
7. Force save on window beforeunload (browser close/refresh)

## Verification
- Project auto-saves every 30s when changes made
- Visual indicator shows save status
- Auto-save pauses during active editing
- Changes saved before browser close
- Save errors show user-friendly messages

## Estimated
4 hours
