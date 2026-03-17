# Task 10: Frame Decoder

**Milestone**: [M4 - Video Preview & Playback](../../milestones/milestone-4-video-preview-playback.md)
**Dependencies**: Task 2 (ffmpeg.wasm integration), Task 7 (timeline data model)
**Status**: Not Started

## Objective

Build a frame decoder service that extracts individual video frames on demand from a timeline position, using WebCodecs as the primary decoder with an ffmpeg.wasm fallback for unsupported codecs.

## Context

The preview player needs to display the correct frame for any given timeline position. This requires seeking into proxy video files and decoding the frame at that timestamp. WebCodecs provides hardware-accelerated decoding in modern browsers but has limited codec support; ffmpeg.wasm covers the rest. The decoder should work with the proxy files generated during media import (M2) and return decoded frames as ImageBitmap or VideoFrame objects ready for canvas rendering.

## Steps

### 1. Create the decoder abstraction

Define a `FrameDecoder` interface that accepts a media source URL and a timestamp, returning a decoded frame. This abstraction allows swapping between WebCodecs and ffmpeg.wasm backends transparently.

### 2. Implement WebCodecs backend

- Use `VideoDecoder` from the WebCodecs API
- Parse container metadata (MP4 demuxing) to locate the nearest keyframe
- Seek to the keyframe, decode forward to the target timestamp
- Cache recent decoded frames in an LRU cache to speed up scrubbing
- Run decoding in a Web Worker to keep the main thread responsive

### 3. Implement ffmpeg.wasm fallback

- Detect when WebCodecs is unavailable or the codec is unsupported
- Use ffmpeg.wasm to extract a single frame at the target timestamp (`-ss` seeking)
- Convert the raw frame output to ImageBitmap
- Run in the existing ffmpeg Web Worker from M1

### 4. Add frame cache

- Implement an LRU cache (configurable size, default ~60 frames) keyed by `(clipId, timestamp)`
- Pre-decode a window of frames around the current position during playback
- Invalidate cache entries when clips are trimmed or reordered

### 5. Wire to timeline state

- Subscribe to the timeline store's current position
- Map timeline position to the correct clip and local timestamp within that clip
- Handle gaps, overlapping tracks, and clips with in/out points

## Verification

- [ ] Seeking to a timestamp returns the visually correct frame within 100ms
- [ ] WebCodecs path activates on supported browsers (Chrome/Edge); ffmpeg.wasm path activates elsewhere
- [ ] Frame cache prevents redundant decodes during scrubbing
- [ ] Decoding runs off the main thread (no jank on UI)
- [ ] Handles edge cases: first frame, last frame, empty timeline, missing media
