# Task 4: File Upload UI

## Objective

Build a drag-and-drop file upload component with file type validation and an upload progress indicator.

## Context

This is the user's entry point for getting media into the editor. It needs to feel responsive, validate files before upload begins, and show clear progress feedback. The actual upload endpoint is built in Task 5 -- this task focuses on the client-side component.

## Steps

1. Create a reusable `FileUpload` component (`app/components/FileUpload.tsx`) that:
   - Renders a drop zone with visual feedback on drag-over
   - Also supports a traditional file picker button as fallback
   - Accepts multiple files at once
2. Implement file type validation against an allowlist of MIME types (video/mp4, video/webm, video/quicktime, audio/mpeg, audio/wav, image/png, image/jpeg). Reject invalid files with a user-visible error message.
3. Implement file size validation (e.g., max 2 GB per file). Show an error for oversized files.
4. Add an upload progress bar per file using `XMLHttpRequest` or `fetch` with a readable stream to track `upload` progress events.
5. Display upload state per file: pending, uploading (with percentage), complete, error.
6. Wire the component into the `/editor` route. For now, POST to a placeholder endpoint (`/api/upload`) -- the real endpoint comes in Task 5.
7. Style with Tailwind: muted drop zone border, highlight on drag-over, progress bar with transition.

## Verification

- [ ] Dragging a valid video file onto the drop zone highlights it and initiates upload on drop
- [ ] Selecting files via the file picker button works identically
- [ ] Invalid file types show an error message and are not uploaded
- [ ] Files over the size limit show an error message
- [ ] Progress bar updates during upload and reaches 100% on completion
- [ ] Multiple files can be uploaded concurrently with independent progress bars
