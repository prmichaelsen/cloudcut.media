# Milestone 2: Media Import & Storage Pipeline

## Goal

Allow users to upload video/audio/image files through the browser, store originals in GCS, and automatically generate lower-resolution proxy copies for fast timeline editing.

## Overview

This milestone builds the full upload-to-playback pipeline. The client provides a drag-and-drop UI with progress feedback. The server streams uploads to Cloud Storage, kicks off proxy generation (lower-res transcodes via ffmpeg), and returns signed URLs so the client can play back proxies immediately.

## Deliverables

- Drag-and-drop file upload component with type validation and progress indicator
- Server endpoint that streams uploads to GCS and returns signed retrieval URLs
- Server-side proxy generation that creates lower-resolution copies and stores them in GCS

## Success Criteria

- User can drag a video file onto the upload zone and see real-time upload progress
- Uploaded file appears in GCS under a structured path (e.g., `projects/{id}/originals/`)
- A proxy version is generated server-side and stored at `projects/{id}/proxies/`
- Client receives and can play back the proxy via a signed URL
- Invalid file types are rejected before upload begins

## Tasks

1. [task-4-file-upload-ui](../tasks/milestone-2-media-import-storage/task-4-file-upload-ui.md)
2. [task-5-gcs-upload-pipeline](../tasks/milestone-2-media-import-storage/task-5-gcs-upload-pipeline.md)
3. [task-6-proxy-generation](../tasks/milestone-2-media-import-storage/task-6-proxy-generation.md)
