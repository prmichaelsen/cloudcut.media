# Task 7: EDL Data Model

## Objective

Define the Edit Decision List (EDL) JSON schema that represents the full editing state: tracks, clips, effects, transitions, and asset references.

## Context

The EDL is the single source of truth for a project's edit. The timeline UI reads from it, clip operations mutate it, and the final render pipeline consumes it. Getting the schema right early avoids painful migrations later. It needs to be serializable to JSON for persistence and undo/redo support.

## Steps

1. Define TypeScript types in `app/lib/edl/types.ts` for:
   - `Project`: id, name, created/updated timestamps, settings (resolution, frame rate), tracks[]
   - `Track`: id, name, type (video | audio | title), clips[], locked, visible, muted
   - `Clip`: id, assetId, trackId, startTime (position on timeline), duration, inPoint, outPoint, effects[], transitions
   - `Effect`: id, type (e.g., brightness, contrast, blur), parameters (key-value map)
   - `Transition`: id, type (e.g., crossfade, dissolve), duration
   - `Asset`: id, filename, mimeType, originalUrl, proxyUrl, duration, width, height
2. Create a JSON Schema file (`app/lib/edl/edl.schema.json`) that mirrors the TypeScript types for validation purposes.
3. Write factory functions (`app/lib/edl/factories.ts`) to create default instances: `createProject()`, `createTrack()`, `createClip()`, etc.
4. Write serialization helpers (`app/lib/edl/serialize.ts`): `serializeProject(project): string` and `deserializeProject(json: string): Project` with validation.
5. Write unit tests (`app/lib/edl/__tests__/edl.test.ts`) covering:
   - Round-trip serialization/deserialization
   - Factory defaults
   - Validation rejects malformed input

## Verification

- [ ] TypeScript types compile without errors
- [ ] JSON Schema validates a sample EDL document
- [ ] `serializeProject(deserializeProject(json))` produces identical output
- [ ] Factory functions return valid instances that pass schema validation
- [ ] Unit tests pass (`npm test`)
- [ ] Types are importable from other modules without circular dependencies
