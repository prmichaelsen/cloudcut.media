# Task 24: Scene detection

## Objective
Vertex AI Video Intelligence for automatic scene boundary detection.

## Context
Analyze video for scene transitions (cuts, fades), suggest cut points as timeline markers. Help users identify natural cut points to speed up the editing process and find key moments in long videos.

## Steps

1. **Upload video to GCS**
   - Use existing GCS bucket or create dedicated bucket for AI processing
   - Upload video file with unique identifier
   - Generate signed URL for Vertex AI access

2. **Call Vertex AI Video Intelligence shot detection API**
   - Configure Video Intelligence API with shot change detection feature
   - Submit long-running operation for video analysis
   - Include request for confidence scores

3. **Poll for results**
   - Implement polling mechanism with exponential backoff
   - Wait for operation completion (can take several minutes for long videos)
   - Handle timeout scenarios gracefully

4. **Parse shot boundaries with confidence scores**
   - Extract shot change timestamps from API response
   - Record confidence scores for each detected boundary
   - Identify transition types (cut, fade, dissolve) if available

5. **Filter suggestions (only high-confidence cuts)**
   - Apply confidence threshold (e.g., >0.8) to reduce false positives
   - Group closely-spaced boundaries to avoid noise
   - Sort by confidence score for prioritization

6. **Display markers on timeline at suggested cut points**
   - Add visual markers at detected scene boundaries
   - Use distinct color/icon for AI-suggested markers vs. manual markers
   - Show confidence score in marker tooltip

7. **Allow user to accept/reject suggestions**
   - Add UI controls to accept (convert to permanent marker) or reject (hide) suggestions
   - Provide "accept all" and "reject all" bulk actions
   - Allow user to adjust marker position after acceptance

## Verification

- [ ] Scene detection successfully identifies major transitions in test videos
- [ ] Markers appear on timeline at suggested cut points
- [ ] Confidence scores are visible in marker tooltips
- [ ] User can accept individual suggestions to convert to permanent markers
- [ ] User can reject suggestions to hide them from timeline
- [ ] Bulk actions (accept all, reject all) work correctly
- [ ] API errors are handled gracefully with user-friendly messages
- [ ] Long videos (>10 minutes) process successfully without timeout
- [ ] Accepted markers can be used as cut points in editing

## Estimated Time
6 hours
