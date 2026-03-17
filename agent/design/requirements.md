# Project Requirements

**Project Name**: cloudcut.media
**Created**: 2026-03-17
**Status**: Draft

---

## Overview

A WebAssembly-powered browser-based video editor with cloud rendering. The client runs a rich editing UI in the browser using WASM for lightweight operations (timeline, preview, filters), while offloading intensive work (transcoding, AI features, full-resolution rendering) to a persistent GCP-backed server via WebSocket.

---

## Problem Statement

Professional video editing is locked behind heavy native applications (Premiere, DaVinci, Final Cut). Web-based alternatives exist but are either too limited for serious work or require full server-side rendering that introduces latency. cloudcut.media bridges this gap by combining client-side WASM performance with on-demand cloud compute for heavy lifting — accessible from any browser with no install.

---

## Goals and Objectives

### Primary Goals
1. Deliver a responsive, browser-based video editing experience with <100ms interaction latency for timeline operations
2. Offload transcoding, AI features, and full-resolution rendering to GCP backend
3. Use a proxy editing model — edit with low-res proxies client-side, final render server-side

### Secondary Goals
1. Support offline/degraded-connection editing for basic operations
2. Provide AI-powered features (auto-captions, scene detection) via Vertex AI
3. Minimize cloud cost through autoscaling and idle shutdown policies

---

## Functional Requirements

### Core Features
1. **Timeline Editor**: Multi-track video/audio timeline with drag-and-drop, trimming, splitting, and reordering
2. **Video Preview**: Real-time preview playback of the current edit using proxy media and WASM decoding
3. **Media Import**: Upload video/audio/image assets to GCS with automatic proxy generation server-side
4. **Basic Effects**: Crops, color adjustments, text overlays, transitions — processed client-side via WASM + WebGL
5. **Export/Render**: Server-side full-resolution render from the edit decision list (EDL), with progress streamed back via WebSocket
6. **Persistent Connection**: WebSocket link to a warm GCP backend for real-time status, render progress, and control messages

### Additional Features
1. **Auto-Captions**: AI-generated subtitles via Vertex AI speech-to-text
2. **Scene Detection**: Automatic cut detection for imported footage
3. **Audio Waveforms**: Client-side waveform rendering for audio tracks
4. **Project Save/Load**: Persist edit state (EDL as JSON) to cloud storage

---

## Non-Functional Requirements

### Performance
- Timeline scrubbing and playback at 30fps using proxy media
- Preview frame decode <33ms (via WASM FFmpeg or WebCodecs)
- WebSocket round-trip <100ms for interactive operations against warm backend

### Security
- All media assets served via signed GCS URLs (time-limited)
- Authentication required for all API and WebSocket connections
- User data isolated per account

### Scalability
- Backend scales horizontally for concurrent render jobs (Cloud Run Jobs or Batch)
- Persistent connection instances autoscale based on active editors
- Media storage scales with GCS (no practical limit)

### Reliability
- Client continues functioning for basic edits if connection drops (graceful degradation)
- Edit state auto-saved to prevent data loss
- Render jobs are idempotent and resumable

---

## Technical Requirements

### Technology Stack
- **Frontend**: TypeScript, TanStack Start, Tailwind CSS
- **WASM Runtime**: FFmpeg compiled to WASM (ffmpeg.wasm) for codec operations
- **GPU Rendering**: WebGL/WebGPU for real-time preview filters and effects
- **Backend**: TypeScript, Node.js on GCP
- **Persistent Connection**: WebSocket (Cloud Run supports WebSocket)
- **Storage**: Google Cloud Storage (media assets, proxy files)
- **Compute**: GCE or GKE with GPU instances for rendering; Cloud Run for API/WebSocket
- **AI**: Vertex AI for auto-captions, scene detection
- **CDN**: Cloud CDN for proxy media delivery

### Browser APIs
- **HTML5 Video Element**: Hardware-accelerated playback (universal support, baseline for MVP)
- **Canvas API**: Waveform rendering, text overlays, lightweight effects
- **WebCodecs**: Hardware-accelerated encode/decode (Chromium/Android Capacitor only; progressive enhancement)
- **ffmpeg.wasm**: Client-side video operations fallback (iOS Safari/Capacitor, Firefox)
- **OPFS** (Origin Private File System): Local caching of video chunks
- **SharedArrayBuffer + Web Workers**: Multi-threaded WASM execution (requires cross-origin isolation headers)

**Target Platforms (Priority Order)**:
1. iOS Safari (webkit)
2. iOS Capacitor (webkit)
3. Android Capacitor (chromium)
4. Desktop Chrome
5. Desktop Firefox
6. Desktop Safari

### Dependencies
- ffmpeg.wasm: Client-side video decoding/encoding
- @anthropic-ai/sdk or Vertex AI SDK: AI features
- GCS client: Asset upload/download
- WebSocket library: Persistent connection management

---

## Architecture Decisions

### 1. Proxy Editing Model
Edit with low-resolution proxy files client-side. Final render happens server-side at full resolution. This is standard in professional tools and sidesteps WASM's 4GB memory limit.

### 2. Chunk-Based Streaming
Never load full videos into WASM memory. Stream segments from GCS, decode frames on demand. Use OPFS for local caching of recently accessed chunks.

### 3. Edit Decision List (EDL) as Source of Truth
The timeline state is a lightweight JSON document describing cuts, effects, and asset references. This EDL is synced via WebSocket. Heavy media stays in GCS — the client and server both reference the same EDL to produce output.

### 4. Warm Backend Instances
Interactive preview requires <100ms round-trip. Keep warm GCE/GKE instances for active sessions rather than relying on cold-start Cloud Run. Use Cloud Run for non-interactive jobs (export, transcoding).

### 5. WebSocket for Persistent Connection
WebSocket over gRPC-Web or SSE because:
- Bidirectional (client sends commands, server pushes progress/status)
- Cloud Run now supports WebSocket natively
- Simpler than WebRTC for non-media-streaming use cases

### 6. Plugin Architecture from Day 1
Core code is designed with well-defined extension points (effect registry, export pipeline, timeline tools, etc.) following the VSCode extension model. This enables future third-party plugins without costly refactoring, even though the plugin loader itself is deferred to P10. See `agent/design/local.plugin-architecture.md` for details.

---

## User Stories

### As a Video Creator
1. I want to upload a video and start editing immediately so that I don't wait for server processing
2. I want to scrub through my timeline smoothly so that I can find the right edit points
3. I want to apply text and color effects in real-time so that I can preview my edits instantly
4. I want to export my final video at full resolution so that I get professional quality output
5. I want to see render progress in real-time so that I know when my export will be ready

### As a Content Creator
1. I want auto-generated captions so that I can add subtitles without manual transcription
2. I want scene detection so that I can quickly navigate long footage
3. I want my projects saved automatically so that I never lose work

---

## Constraints

### Technical Constraints
- WASM has a 4GB memory limit per module — cannot load full high-res videos client-side
- WebCodecs API is Chromium-only; Firefox/Safari require WASM FFmpeg fallback (slower)
- Cross-origin isolation headers required for SharedArrayBuffer (multi-threaded WASM)
- Browser codec support is uneven across browsers

### Business Constraints
- Solo developer for initial implementation
- Cloud costs must be managed — GPU instances are expensive
- MVP should demonstrate core editing + cloud render loop

### Resource Constraints
- GCP budget constraints for persistent GPU instances
- Need autoscaling and idle shutdown to control costs

---

## Success Criteria

### MVP Success Criteria
- [ ] User can upload a video file and see it in the timeline
- [ ] User can trim, split, and reorder clips on the timeline
- [ ] User can preview edits in real-time using proxy media
- [ ] User can export a rendered video via the GCP backend
- [ ] WebSocket connection delivers render progress to the client
- [ ] Basic text overlay and color adjustment effects work client-side

### Full Release Success Criteria
- [ ] Multi-track audio/video editing
- [ ] AI-powered auto-captions
- [ ] Scene detection for imported footage
- [ ] Offline editing for basic operations
- [ ] Cross-browser support (Chrome, Firefox, Safari)
- [ ] Project save/load with cloud persistence

---

## Out of Scope

1. **Real-time collaboration**: Single-user editing for MVP
2. **Mobile editing**: Desktop browser focus initially (target: iOS Safari + Capacitor, Android Capacitor)
3. **Plugin system implementation**: No plugin loader or marketplace for MVP (deferred to P10), but core code is designed with extension points from day 1 to support future third-party feature modules (effects, transitions, export formats, AI tools) — see `agent/design/local.plugin-architecture.md`
4. **Streaming/live editing**: Pre-recorded content only
5. **Self-hosted/on-premise**: GCP-only deployment

---

## Assumptions

1. Users have a modern browser with WASM support (Chrome, Firefox, Safari latest)
2. Users have reasonable internet connectivity for media upload/download
3. GCP services (GCS, Cloud Run, GCE) remain available and stable
4. ffmpeg.wasm continues to be maintained and performant
5. WebCodecs API will eventually ship in Firefox and Safari

---

## Risks

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|---------------------|
| WASM memory limits hit with complex edits | High | Medium | Proxy editing model, chunk-based streaming, aggressive memory management |
| WebCodecs not available in Firefox/Safari | Medium | High | WASM FFmpeg fallback, feature detection at runtime |
| GCP GPU instance costs exceed budget | High | Medium | Autoscaling, idle shutdown, spot/preemptible instances, Cloud Run Jobs for batch |
| WebSocket connection instability | Medium | Medium | Auto-reconnect, EDL state reconciliation on reconnect, local-first editing |
| ffmpeg.wasm performance insufficient for real-time preview | Medium | Low | WebCodecs where available, reduce preview resolution, offload to server |

---

## GCP Service Mapping

| Need | Service |
|------|---------|
| Persistent compute (rendering) | GCE or GKE (GPU instances) |
| Burst transcoding / export | Cloud Run Jobs or Batch |
| API + WebSocket server | Cloud Run |
| Asset storage | Cloud Storage |
| AI features | Vertex AI |
| CDN for proxy media | Cloud CDN |

---

**Status**: Draft
**Last Updated**: 2026-03-17
**Next Review**: After milestone planning
