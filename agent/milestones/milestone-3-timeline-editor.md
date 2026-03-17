# Milestone 3: Timeline Editor

## Goal

Build a functional multi-track timeline editor where users can arrange, trim, split, and reorder clips, backed by a well-defined EDL (Edit Decision List) data model.

## Overview

This is the core editing surface. It starts with a JSON schema that represents the edit state (tracks, clips, transitions, effects, asset references), then layers a visual timeline UI on top, and finally wires up the clip manipulation operations that make it interactive.

## Deliverables

- EDL JSON schema defining tracks, clips, effects, transitions, and asset references
- Multi-track timeline UI with time ruler, track lanes, clip blocks, zoom, and scroll
- Clip operations: trim, split, reorder, delete, drag-and-drop between tracks

## Success Criteria

- EDL schema validates correctly and round-trips through JSON serialization
- Timeline renders multiple tracks with clips positioned by in/out points
- User can trim a clip by dragging its edges, split a clip at the playhead, and drag clips between tracks
- All operations update the EDL state and the timeline re-renders to reflect changes
- Zoom and scroll work smoothly across a multi-minute timeline

## Tasks

1. [task-7-edl-data-model](../tasks/milestone-3-timeline-editor/task-7-edl-data-model.md)
2. [task-8-timeline-ui](../tasks/milestone-3-timeline-editor/task-8-timeline-ui.md)
3. [task-9-clip-operations](../tasks/milestone-3-timeline-editor/task-9-clip-operations.md)
