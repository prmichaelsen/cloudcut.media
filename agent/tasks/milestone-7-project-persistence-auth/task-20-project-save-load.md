# Task 20: Project Save/Load

## Objective
Save/load EDL + metadata to user-scoped GCS buckets.

## Context
Projects need to persist between sessions. Store EDL JSON + metadata (title, created date, thumbnail) in GCS with path: `users/{userId}/projects/{projectId}/project.json`.

## Steps
1. Create GCS bucket for user projects (or use existing with ACLs)
2. Build project save function: serialize EDL + metadata to JSON, upload to GCS
3. Build project load function: download JSON from GCS, deserialize to EDL
4. Generate project thumbnail (canvas snapshot of timeline preview)
5. Add save button in header with keyboard shortcut (Ctrl+S / Cmd+S)
6. Add "Save As" for duplicating projects
7. Handle save conflicts (if project modified elsewhere, prompt user)

## Verification
- User can save a project and see success toast
- User can load a saved project and resume editing
- Project thumbnail displays correctly in project list
- Keyboard shortcut (Ctrl+S) saves project

## Estimated
6 hours
