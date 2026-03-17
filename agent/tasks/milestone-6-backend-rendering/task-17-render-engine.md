# Task 17: Render Engine

**Milestone**: [M6 - Backend Rendering & WebSocket Connection](../../milestones/milestone-6-backend-rendering.md)
**Dependencies**: Task 3 (GCP project setup), Task 16 (WebSocket server)
**Status**: Not Started

## Objective

Build a server-side render engine that accepts an EDL JSON document, resolves original-resolution assets from GCS, renders full-resolution video using FFmpeg, and uploads the output to GCS.

## Context

The client-side preview uses low-resolution proxies. For final export, the server re-renders the project at full resolution using FFmpeg with access to the original uploaded media in GCS. The render engine translates the EDL (cuts, transitions, text overlays, color adjustments) into an FFmpeg filter graph and executes it. The engine runs as a worker process triggered by the WebSocket server (Task 16).

## Steps

### 1. EDL-to-FFmpeg translator

- Parse the EDL JSON into an internal representation
- Map each clip to an FFmpeg input with seek/duration (`-ss`, `-t`)
- Map transitions to FFmpeg filter graph nodes: `xfade` for crossfade, `fade` for fade-to-black
- Map color adjustments to `eq` and `hue` filters
- Map text overlays to `drawtext` filter with font, position, timing
- Generate the complete FFmpeg command line or filter_complex graph

### 2. Asset resolution

- For each media reference in the EDL, resolve the GCS URI to a signed URL or download the file to a local temp directory
- Use streaming downloads where possible to reduce startup latency
- Validate that all referenced assets exist before starting the render

### 3. FFmpeg execution

- Spawn FFmpeg as a child process with the generated arguments
- Parse FFmpeg's stderr progress output (frame count, fps, time, speed) into structured progress events
- Stream progress events back through the caller (WebSocket server) at a throttled rate (e.g., every 500ms)
- Handle FFmpeg errors: parse error output, map to user-friendly messages

### 4. Output handling

- Write the rendered file to a temp directory, then upload to GCS at a deterministic path (`renders/{userId}/{projectId}/{timestamp}.mp4`)
- Generate a signed download URL with a configurable expiration (default 24 hours)
- Clean up temp files after upload completes

### 5. Resource management

- Set FFmpeg resource limits (max threads, memory) appropriate for the Cloud Run instance size
- Implement a render timeout (default 30 minutes) to prevent runaway jobs
- Support cancellation: kill the FFmpeg process if the client disconnects or sends a cancel message

## Verification

- [ ] A simple EDL (two clips with a cut) produces a valid MP4 output
- [ ] Transitions (crossfade, fade to black) render correctly in the output
- [ ] Text overlays appear at the correct position, time range, and styling
- [ ] Color adjustments match the client-side preview visually
- [ ] Progress events report accurate completion percentage
- [ ] Missing assets produce a clear error before rendering starts
- [ ] Output file uploads to GCS and the signed URL downloads correctly
- [ ] Render cancellation kills the FFmpeg process and cleans up temp files
