# Milestone 6: Backend Rendering & WebSocket Connection

## Goal

Stand up the server-side render pipeline so users can export full-resolution video from their browser-edited projects, with live progress updates over WebSockets.

## Overview

Client-side preview is low-resolution by design. For final output, the client sends its EDL JSON to a Cloud Run service over a WebSocket connection. The server resolves original assets from GCS, renders the full-resolution video using FFmpeg, uploads the result to GCS, and streams progress updates back to the client. The client then downloads the final file via a signed URL. This milestone also establishes the WebSocket infrastructure (auth, heartbeat, reconnect) that future real-time features will reuse.

## Deliverables

- Cloud Run WebSocket server with connection management, JWT authentication, heartbeat/keepalive, and client-side auto-reconnect
- Server-side render engine that accepts EDL JSON, resolves assets from GCS, renders full-resolution video with FFmpeg, and writes output to GCS
- End-to-end export flow: client submits EDL, server renders with progress streaming, client downloads final file via signed URL

## Success Criteria

- WebSocket connections authenticate, stay alive across idle periods, and auto-reconnect on network interruption
- The render engine produces a valid MP4 from an EDL containing cuts, transitions, text overlays, and color adjustments
- Progress updates stream to the client in real-time (percent complete, current step)
- The exported file downloads successfully via a time-limited signed GCS URL
- Render errors are reported back to the client with actionable messages

## Architectural Considerations

**Plugin Extension Points**: Design the render pipeline to support future plugin-based export formats:
- **Export Format Registry**: Built-in MP4 export should register via the same interface third-party formats (ProRes, DNxHD, etc.) will use later
- **Render Pipeline Stages**: Separate EDL parsing, asset resolution, effect application, and encoding into distinct stages so plugins can hook into specific steps
- **Progress Events**: Standardized progress event format that both built-in and plugin exporters can emit

See `agent/design/local.plugin-architecture.md` for extension point patterns.

## Tasks

1. [task-16-websocket-server](../tasks/milestone-6-backend-rendering/task-16-websocket-server.md) — Cloud Run WebSocket server with auth and reconnect
2. [task-17-render-engine](../tasks/milestone-6-backend-rendering/task-17-render-engine.md) — Server-side FFmpeg render engine
3. [task-18-export-flow](../tasks/milestone-6-backend-rendering/task-18-export-flow.md) — End-to-end export flow with progress streaming
