# Task 15: Transitions

**Milestone**: [M5 - Client-Side Effects](../../milestones/milestone-5-client-side-effects.md)
**Dependencies**: Task 10 (frame decoder), Task 11 (preview player), Task 14 (WebGL pipeline)
**Status**: Not Started

## Objective

Implement basic transitions between adjacent clips — crossfade, hard cut, and fade to black — with real-time preview during playback and scrubbing.

## Context

Transitions smooth the joins between clips and are a core editing capability. The system needs to decode frames from both the outgoing and incoming clips during the transition window and blend them in the WebGL pipeline. Transition type and duration are stored in the EDL for server-side rendering.

## Steps

### 1. Define the transition data model

- Add a `Transition` type to the EDL: `id`, `type` (crossfade | cut | fadeToBlack), `duration` (in frames or milliseconds), placed at the junction between two adjacent clips
- Store transitions as properties on the cut point between clips (or as separate timeline items)

### 2. Implement transition rendering in WebGL

- **Crossfade**: blend outgoing frame and incoming frame using `mix(colorA, colorB, progress)` where progress goes from 0 to 1 over the transition duration
- **Cut**: no blending, instant switch (default behavior, zero-duration transition)
- **Fade to black**: blend outgoing frame to black, then black to incoming frame (two-phase)
- Use the existing WebGL pipeline from Task 14; add a second texture sampler for the incoming clip

### 3. Coordinate frame decoding during transitions

- During a transition window, the FrameDecoder must provide frames from both clips simultaneously
- Pre-decode the first few frames of the incoming clip as the transition approaches
- Manage the additional decode load without dropping the playback framerate

### 4. Build the transition UI

- When two clips are adjacent on the same track, show a transition zone at their junction
- Click the transition zone to select it; show a dropdown to pick transition type
- Drag the transition edges to adjust duration
- Default transition: hard cut (zero duration)

### 5. Timeline visualization

- Render a visual indicator (e.g., diagonal gradient icon) on the timeline at transition points
- Show the transition duration as an overlapping region between the two clips
- Update the indicator when transition type or duration changes

## Verification

- [ ] Crossfade blends two clips smoothly over the configured duration during playback
- [ ] Fade to black produces a visible black dip between clips
- [ ] Hard cut switches instantly with no blending artifacts
- [ ] Scrubbing through a transition renders the correct blended frame at each position
- [ ] Transition type and duration can be changed via the UI
- [ ] Transitions are stored in the EDL and survive save/reload
- [ ] Playback framerate does not drop below 24fps during transitions at proxy resolution
