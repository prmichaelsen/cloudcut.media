# Task 18: Export Flow

**Milestone**: [M6 - Backend Rendering & WebSocket Connection](../../milestones/milestone-6-backend-rendering.md)
**Dependencies**: Task 16 (WebSocket server), Task 17 (render engine)
**Status**: Not Started

## Objective

Wire together the end-to-end export flow: the client sends the EDL over WebSocket, the server renders the project, streams progress updates back, and the client downloads the final file via a signed GCS URL.

## Context

This task is the integration point that connects the client-side editor to the server-side render pipeline. It covers the user-facing export UI, the message exchange protocol, progress visualization, error handling, and final download. The goal is a seamless experience where the user clicks "Export," watches a progress bar, and gets their video.

## Steps

### 1. Build the export UI

- Add an "Export" button to the editor toolbar
- On click, show an export settings dialog: output resolution (1080p/4K), format (MP4), quality preset (fast/balanced/quality)
- After confirming, show a progress modal with: progress bar, current step label (e.g., "Rendering clip 3 of 7..."), elapsed time, cancel button

### 2. Serialize and send the EDL

- Serialize the current project state to the EDL JSON format
- Include all clips, transitions, text overlays, color adjustments, and asset references (GCS URIs)
- Send a `render:start` message over the WebSocket with the EDL payload and export settings
- Handle the case where the WebSocket is disconnected: reconnect and retry, or show an error

### 3. Handle progress updates

- Listen for `render:progress` messages from the server
- Update the progress bar and step label in the export modal
- Show estimated time remaining based on the progress rate
- Log progress events for debugging

### 4. Handle completion

- On `render:complete` message, receive the signed download URL
- Show a "Download" button in the export modal
- Trigger the download using an anchor element with the signed URL
- Optionally show a preview thumbnail of the rendered output

### 5. Handle errors and cancellation

- On `render:error` message, show the error message in the export modal with a "Retry" button
- If the user clicks "Cancel," send a `render:cancel` message to the server
- Handle WebSocket disconnection during render: show a warning, attempt reconnect, resume progress listening
- Handle server-side timeout: show a message suggesting the user try a lower resolution or shorter project

### 6. Export history

- Store completed exports in a list (in-memory or persisted) with: timestamp, project name, download URL, expiration time
- Show a simple export history panel so users can re-download recent exports before the signed URL expires

## Verification

- [ ] Clicking "Export" sends the EDL and starts a server-side render
- [ ] Progress bar updates smoothly and reflects actual render progress
- [ ] Completed render produces a downloadable MP4 via the signed URL
- [ ] Cancellation stops the server-side render within a few seconds
- [ ] Render errors display a user-friendly message with retry option
- [ ] Export works after a WebSocket reconnection mid-render
- [ ] Export settings (resolution, quality) are respected in the output file
- [ ] Export history shows recent exports with working download links
