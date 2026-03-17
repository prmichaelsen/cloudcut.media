# Milestone 8: AI Features

## Goal

Add AI-powered features (auto-captions, scene detection) via Vertex AI to differentiate cloudcut.media from basic video editors and accelerate editing workflows.

## Overview

Professional editors spend significant time on repetitive tasks: transcribing audio for captions, manually marking scene boundaries. M8 integrates Vertex AI to automate these tasks. Auto-captions generate accurate subtitles from video audio using speech-to-text. Scene detection analyzes video and suggests cut points at scene transitions, saving hours of manual scrubbing.

## Deliverables

- Auto-captions via Vertex AI Speech-to-Text — extract audio, send to API, import subtitle track to timeline
- Scene detection via Vertex AI Video Intelligence — analyze uploaded videos, suggest cut points, insert markers on timeline
- AI progress UI — show processing status for long-running AI operations
- Caption editor — allow users to review and edit generated captions before adding to timeline

## Success Criteria

- Users can generate captions for a video and see them rendered as a subtitle track on the timeline
- Captions are >90% accurate for clear English speech
- Scene detection identifies major scene transitions (tested on sample videos)
- Users can accept/reject suggested scene cuts
- AI operations show progress indicators and handle failures gracefully

## Architectural Considerations

**Plugin Extension Points**: Design AI features for extensibility:
- **AI Service Registry**: Built-in Vertex AI should register via the same interface third-party AI providers (OpenAI, Anthropic, local models) will use later
- **AI Pipeline**: Separate job submission, polling, and result processing so plugins can provide custom AI workflows
- **Result Format**: Standardized output formats (WebVTT for captions, timecode markers for scenes) that plugins can generate

See `agent/design/local.plugin-architecture.md` for extension point patterns.

## Tasks

1. [task-23-auto-captions](../tasks/milestone-8-ai-features/task-23-auto-captions.md) — Vertex AI Speech-to-Text integration for automatic subtitle generation
2. [task-24-scene-detection](../tasks/milestone-8-ai-features/task-24-scene-detection.md) — Vertex AI Video Intelligence for automatic scene boundary detection
3. [task-25-caption-editor](../tasks/milestone-8-ai-features/task-25-caption-editor.md) — UI for reviewing and editing generated captions before adding to timeline
