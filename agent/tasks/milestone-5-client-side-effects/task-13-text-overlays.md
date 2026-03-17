# Task 13: Text Overlays

**Milestone**: [M5 - Client-Side Effects](../../milestones/milestone-5-client-side-effects.md)
**Dependencies**: Task 11 (preview player)
**Status**: Not Started

## Objective

Build a text overlay system that lets users add, edit, position, and style text on top of video, rendered in the preview via canvas or WebGL.

## Context

Text overlays are one of the most common video editing operations — titles, lower thirds, captions, watermarks. The system needs an in-preview editing experience (click to place, drag to move, type to edit) and a property panel for fine-grained control. Text overlay definitions are stored in the EDL so they can be reproduced by the server-side render engine.

## Steps

### 1. Define the text overlay data model

- Add a `TextOverlay` type to the EDL schema: `id`, `text`, `position` (x, y as percentage of frame), `fontFamily`, `fontSize`, `fontWeight`, `color`, `backgroundColor`, `opacity`, `alignment`, `startTime`, `endTime`
- Store overlays as items on a dedicated overlay track in the timeline

### 2. Build the text properties panel

- UI panel with controls for: text content (textarea), font family (dropdown of web-safe + Google Fonts), font size, weight, color (color picker), background color, opacity slider, alignment (left/center/right)
- Changes update the EDL in real-time and trigger a preview re-render

### 3. Render text on the preview canvas

- After drawing the video frame, render text overlays that are active at the current timestamp
- Use `CanvasRenderingContext2D.fillText` for initial implementation
- Respect position, styling, and opacity from the data model
- Layer multiple overlays in z-order

### 4. Enable in-preview interaction

- Click on the preview canvas to place a new text overlay at that position
- Drag existing overlays to reposition them
- Double-click an overlay to enter inline edit mode
- Show selection handles (bounding box) around the selected overlay

### 5. Timeline integration

- Show text overlay clips on the overlay track in the timeline
- Allow trimming overlay duration by dragging clip edges
- Snap overlay start/end to playhead or other clip boundaries

## Verification

- [ ] Users can add a text overlay and see it rendered on the preview
- [ ] Text content, font, size, color, and position are all editable
- [ ] Overlays can be dragged to reposition within the preview
- [ ] Overlays appear only during their defined time range
- [ ] Multiple overlays can coexist and layer correctly
- [ ] Overlay data persists in the EDL and survives save/reload
- [ ] Font rendering looks crisp at the preview resolution
