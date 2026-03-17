# Milestone 5: Client-Side Effects

## Goal

Allow users to add text overlays, color adjustments, and transitions to their projects, all previewed in real-time via canvas/WebGL rendering.

## Overview

This milestone introduces the first creative tools beyond cut editing. Text overlays let users add titles and captions. Color adjustment controls (brightness, contrast, saturation, hue) are applied as WebGL shaders so they preview instantly. Basic transitions (crossfade, cut, fade to black) give clips polished joins. All effects are described in the EDL data model so they can be reproduced by the server-side render engine later.

## Deliverables

- Text overlay system — add, edit, position, style, and font-select text rendered on the preview canvas via canvas 2D or WebGL
- Color adjustment controls — brightness, contrast, saturation, hue sliders applied as WebGL fragment shaders in the preview
- Transition system — crossfade, cut, and fade-to-black between adjacent clips, previewed in real-time

## Success Criteria

- Users can add a text overlay, edit its content and style, drag it to reposition, and see it rendered on the preview
- Color adjustments update the preview frame in real-time as sliders move
- Transitions render smoothly between clips during playback at proxy resolution
- All effects are serialized into the EDL JSON and survive save/reload
- Effects compose correctly (e.g., text on a color-adjusted clip with a transition)

## Tasks

1. [task-13-text-overlays](../tasks/milestone-5-client-side-effects/task-13-text-overlays.md) — Text overlay system with positioning and styling
2. [task-14-color-adjustments](../tasks/milestone-5-client-side-effects/task-14-color-adjustments.md) — Color adjustment controls via WebGL shaders
3. [task-15-transitions](../tasks/milestone-5-client-side-effects/task-15-transitions.md) — Basic transitions between clips
