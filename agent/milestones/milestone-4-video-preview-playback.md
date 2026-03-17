# Milestone 4: Video Preview & Playback

## Goal

Enable real-time video preview and playback directly in the browser, with frame-accurate scrubbing synced to the timeline and visible audio waveforms.

## Overview

This milestone bridges the timeline editor (M3) and the editing experience by letting users actually see and hear their project. A frame decoder extracts frames on demand, a canvas-based player handles playback and seeking, and audio waveforms give visual feedback on each track. All decoding happens client-side using WebCodecs where available, falling back to ffmpeg.wasm.

## Deliverables

- Frame decoder service using WebCodecs (ffmpeg.wasm fallback) that decodes proxy video frames on demand from any timeline position
- Canvas-based preview player component with play/pause/seek and frame-accurate scrubbing synced to timeline state
- Audio waveform extraction and rendering on timeline tracks, synchronized with the playback position

## Success Criteria

- Seeking to any point on the timeline renders the correct video frame within 100ms
- Play/pause toggles smoothly at the proxy resolution without dropped frames at 30fps
- Scrubbing the timeline updates the preview in real-time
- Audio waveforms render for imported media and scroll/zoom with the timeline
- Playback position indicator stays in sync between the timeline and the preview player

## Tasks

1. [task-10-frame-decoder](../tasks/milestone-4-video-preview-playback/task-10-frame-decoder.md) — Frame decoder using WebCodecs with ffmpeg.wasm fallback
2. [task-11-preview-player](../tasks/milestone-4-video-preview-playback/task-11-preview-player.md) — Canvas-based preview player with play/pause/seek/scrub
3. [task-12-audio-waveforms](../tasks/milestone-4-video-preview-playback/task-12-audio-waveforms.md) — Audio waveform extraction and timeline rendering
