# Task 14: Color Adjustments

**Milestone**: [M5 - Client-Side Effects](../../milestones/milestone-5-client-side-effects.md)
**Dependencies**: Task 11 (preview player)
**Status**: Not Started

## Objective

Add color adjustment controls — brightness, contrast, saturation, and hue — applied as WebGL shaders in the preview player for real-time feedback.

## Context

Color correction is fundamental to video editing. By implementing adjustments as WebGL fragment shaders, the preview can update instantly as users move sliders, with zero decoding overhead. The adjustment parameters are stored per-clip in the EDL so the server-side render engine can apply equivalent FFmpeg filters during export.

## Steps

### 1. Set up WebGL rendering pipeline

- Transition the preview canvas from 2D context to WebGL (or WebGL2)
- Create a basic passthrough shader that renders a video frame texture to the canvas with no modifications
- Ensure the existing frame drawing path still works through WebGL

### 2. Write color adjustment fragment shaders

- Brightness: multiply RGB by a factor
- Contrast: scale RGB around 0.5 midpoint
- Saturation: interpolate between grayscale luminance and original color
- Hue: rotate in HSL color space
- Combine all adjustments into a single fragment shader to minimize draw calls

### 3. Build the adjustment controls UI

- Panel with sliders for brightness (-100 to +100), contrast (-100 to +100), saturation (-100 to +100), hue (-180 to +180)
- Default all sliders to 0 (no adjustment)
- Show a reset button to return all values to defaults
- Controls are context-sensitive — they edit the currently selected clip's adjustments

### 4. Store adjustments in the EDL

- Add a `colorAdjustments` object to the clip data model: `{ brightness, contrast, saturation, hue }`
- Default to neutral values when a clip has no adjustments
- Map EDL values to shader uniform values when rendering

### 5. Map to FFmpeg filters for export

- Document the FFmpeg filter equivalents: `eq=brightness=:contrast=:saturation=`, `hue=h=`
- Store the mapping so the render engine (M6) can apply identical adjustments server-side

## Verification

- [ ] Moving a slider updates the preview frame instantly (no perceptible delay)
- [ ] Each adjustment (brightness, contrast, saturation, hue) produces the expected visual result
- [ ] Adjustments compose correctly when multiple sliders are changed
- [ ] Adjustments are per-clip — selecting a different clip shows that clip's values
- [ ] Reset button returns the preview to the unadjusted frame
- [ ] Adjustment values persist in the EDL and survive save/reload
- [ ] WebGL rendering does not regress the existing preview player functionality
