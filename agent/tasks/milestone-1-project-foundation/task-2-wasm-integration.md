# Task 2: WASM Integration

## Objective

Integrate ffmpeg.wasm into the project, configure the required cross-origin isolation headers, and set up a Web Worker so ffmpeg runs off the main thread.

## Context

ffmpeg.wasm requires `SharedArrayBuffer`, which browsers only expose when the page is served with `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` headers. Running ffmpeg in a Web Worker prevents blocking the UI during transcoding or probing operations.

## Steps

1. Install `@ffmpeg/ffmpeg` and `@ffmpeg/util` as dependencies.
2. Configure the Vite dev server (and TanStack Start server middleware) to set the required COOP/COEP headers on all responses:
   - `Cross-Origin-Opener-Policy: same-origin`
   - `Cross-Origin-Embedder-Policy: require-corp`
3. Create a Web Worker file (`app/workers/ffmpeg.worker.ts`) that:
   - Imports and initializes the FFmpeg instance
   - Listens for messages from the main thread (e.g., `{ type: 'probe', file: ArrayBuffer }`)
   - Posts results back to the main thread
4. Create a wrapper module (`app/lib/ffmpeg.ts`) that spawns the worker, provides a promise-based API (e.g., `probeFile(file: File): Promise<MediaInfo>`), and handles worker lifecycle.
5. Add a test UI on the `/editor` route: a file input that accepts a video file, runs `probeFile`, and displays the returned metadata (duration, resolution, codec).
6. Verify `SharedArrayBuffer` is defined in the browser console when the dev server is running.

## Verification

- [ ] `SharedArrayBuffer` is available in the browser (check `typeof SharedArrayBuffer !== 'undefined'` in console)
- [ ] COOP and COEP headers are present on page responses (check Network tab)
- [ ] Selecting a video file on `/editor` triggers ffmpeg.wasm probe and displays metadata
- [ ] The main thread UI remains responsive during probe (no jank)
- [ ] No CORS or mixed-content errors in the browser console
