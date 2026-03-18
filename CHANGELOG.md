# Changelog

All notable changes to this project will be documented in this file.

## [0.3.0] - 2026-03-18

### Added
- Multi-layer clip timeline with split, select, resize, and move interactions
- Persistent auth sessions via Firebase Admin SDK session cookies (14-day expiry)
- `/api/auth/login` endpoint — exchanges Firebase ID token for HTTP-only session cookie
- `/api/auth/logout` endpoint — clears session cookie
- SSR session hydration via `getAuthSession` server function and `beforeLoad`
- AuthForm component (email/password with show/hide toggle, login/signup modes, friendly error mapping)
- Firebase SSR stub Vite plugin to prevent client SDK from bundling into Workers
- Cloudflare secrets upload script (`scripts/upload-cloudflare-secrets.ts`)
- Bottom action bar with lucide-react Scissors icon for split (disabled when no clip selected)
- Playhead diamond extends above tracks for easy grabbing without clip interference
- In/out circle handles at bottom edge of timeline (from original design) for selected clip resize
- Dimmed regions outside selected clip range with selection highlight overlay

### Changed
- TimelineEditor rewritten for multi-clip support (was single-clip scrubber)
- Editor stripped to video preview + timeline only (removed drawers, tool strip, speed controls)
- Auth context accepts `initialUser` from SSR for instant hydration
- Media API routes now accept session cookies in addition to Bearer tokens
- All `~` path aliases replaced with relative imports for SSR build compatibility
- Sign-out clears both Firebase client state and server session cookie

### Removed
- Google OAuth sign-in (email/password only)
- Floating drawer UI (trim, speed, export drawers)
- Bottom tool strip
- Token query parameter for video src (session cookies sent automatically)

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
