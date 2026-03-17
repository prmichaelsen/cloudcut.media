# Milestone 1: Project Foundation & Scaffolding

## Goal

Stand up the core development environment: a working TanStack Start app with Tailwind, ffmpeg.wasm running in a Web Worker, and a baseline GCP project with Cloud Run and Cloud Storage ready for use.

## Overview

This milestone covers the foundational plumbing that every subsequent feature depends on. By the end, a developer can run the app locally, trigger an ffmpeg.wasm probe on a local file, and deploy a stub service to Cloud Run that reads/writes to a GCS bucket.

## Deliverables

- TanStack Start project with TypeScript, Tailwind CSS, routing, and dev server
- ffmpeg.wasm loaded in a Web Worker with SharedArrayBuffer / cross-origin isolation headers configured
- GCP project with Cloud Storage bucket, Cloud Run service stub, and service account credentials

## Success Criteria

- `npm run dev` starts the app and renders a landing page at `/`
- A test route can invoke ffmpeg.wasm (e.g., `ffprobe` a sample file) and return metadata to the UI
- `gcloud run deploy` succeeds for the stub service; the service can write a test object to GCS and read it back
- Cross-origin isolation headers are set so `SharedArrayBuffer` is available in the browser

## Architectural Considerations

**Plugin Extension Points**: Establish clean architectural patterns from the start to support future extensibility:
- **Service Layer Pattern**: Core functionality (media processing, storage, effects) should be organized as services with well-defined interfaces
- **Registry Pattern**: Use registries for extensible components (effects, formats, tools) where built-in implementations register the same way future plugins will
- **Dependency Injection**: Consider a lightweight DI container so plugins can access core services without tight coupling

See `agent/design/local.plugin-architecture.md` for details. While plugin loader implementation is P10, the core architecture is established in M1-M6.

## Tasks

1. [task-1-tanstack-start-setup](../tasks/milestone-1-project-foundation/task-1-tanstack-start-setup.md)
2. [task-2-wasm-integration](../tasks/milestone-1-project-foundation/task-2-wasm-integration.md)
3. [task-3-gcp-project-setup](../tasks/milestone-1-project-foundation/task-3-gcp-project-setup.md)
