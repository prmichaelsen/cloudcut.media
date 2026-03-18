# Changelog

All notable changes to this project will be documented in this file.

## [0.2.1] - 2026-03-18

### Added
- TimelineEditor component with playhead diamond handle, in/out circle trim handles
- Touch zone separation (top 30% for playhead, bottom 30% for trim handles)
- Canvas-based waveform rendering with ResizeObserver
- Selection overlay with dimmed regions outside trim range
- Active handle visual feedback (scale, glow, color shift)

## [0.2.0] - 2026-03-18

### Changed
- Migrate from Cloudflare Pages to TanStack Start + Cloudflare Workers architecture
- Upgrade TanStack Start from 1.131.50 to 1.166.16 for `server-entry` support
- Replace Pages Functions with Worker entry point (`src/server.ts`) for R2 API routes
- Update root route to use TanStack Start SSR shell (`HeadContent`, `Scripts`, `shellComponent`)
- Add Tailwind CSS v4 vite plugin to build pipeline
- Update vite.config.ts to match production Workers pattern (cloudflare vite plugin)

### Removed
- Cloudflare Pages Functions (`functions/` directory)
- `app.config.ts` (no longer needed with cloudflare vite plugin)

## [0.1.0] - 2026-03-17

### Added
- Initial TanStack Start project setup
- Cloudflare R2 video upload and playback
- Client-side video trimming with ffmpeg.wasm
- Editor UI with upload, preview, trim controls
