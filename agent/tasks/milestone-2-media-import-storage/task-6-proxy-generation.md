# Task 6: Proxy Generation

## Objective

Generate lower-resolution proxy copies of uploaded videos server-side, store them in GCS, and return proxy URLs to the client for fast timeline playback.

## Context

Full-resolution source files are too heavy for real-time timeline scrubbing in the browser. Proxies (e.g., 720p, lower bitrate) provide smooth playback during editing. The final export uses the original source files. Proxy generation runs server-side using ffmpeg (not ffmpeg.wasm) for performance.

## Steps

1. Install `ffmpeg` in the Cloud Run container (add to Dockerfile) or use a pre-built image that includes it.
2. Create a server function or background job that triggers after a successful upload:
   - Download the original from GCS to a temp directory (or stream it)
   - Transcode to a proxy format: 720p, H.264, moderate bitrate (~2 Mbps), MP4 container
   - Upload the proxy to `projects/{projectId}/proxies/{filename}`
3. Generate a signed URL for the proxy and update the asset record with the proxy GCS path and URL.
4. Expose an API endpoint (`GET /api/assets/{assetId}`) that returns asset metadata including both original and proxy URLs.
5. Handle edge cases: if the source is already low-res (e.g., 720p or below), skip transcoding and use the original as the proxy. For audio-only and image files, skip proxy generation.
6. Add basic error handling: if transcoding fails, mark the asset with a proxy status of `failed` and log the error.

## Verification

- [ ] After uploading a 1080p+ video, a 720p proxy appears in the GCS proxies path
- [ ] `GET /api/assets/{assetId}` returns both original and proxy signed URLs
- [ ] The proxy plays back smoothly in a `<video>` element
- [ ] A 720p source file is not re-transcoded (proxy points to original)
- [ ] Audio and image files have no proxy entry and no errors
- [ ] Failed transcodes are logged and the asset record reflects the failure
