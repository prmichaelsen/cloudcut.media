# Task 28: Analytics

## Objective
Usage tracking, error reporting, performance monitoring (PostHog + Sentry).

## Context
Need visibility into user behavior and performance to guide product decisions. Track how users interact with the app, identify pain points, and monitor performance metrics.

## Steps

1. **Integrate PostHog for usage analytics**
   - Install PostHog SDK
   - Configure PostHog with project API key
   - Initialize on app startup
   - Set up user identification (anonymous by default, identified after auth)
   - Configure PostHog autocapture settings

2. **Track key events**
   - Project created
   - Video uploaded (with duration, format, size)
   - Video exported (with format, duration, quality)
   - Clip created on timeline
   - Effect applied to clip
   - Caption generated
   - Scene detection run
   - Project shared
   - User signed in/out

3. **Add custom properties to events**
   - Video duration (short <1min, medium 1-5min, long >5min)
   - Export format (MP4, WebM, etc.)
   - Export quality (720p, 1080p, 4K)
   - Device type (mobile, tablet, desktop)
   - Browser type and version
   - Network status (online/offline)
   - Feature flags active for user

4. **Integrate Sentry for error and performance monitoring**
   - Configure Sentry performance monitoring
   - Track transaction performance (page loads, API calls)
   - Monitor Web Vitals (LCP, FID, CLS)
   - Track custom performance metrics (video load time, export time)
   - Link Sentry errors to PostHog user sessions

5. **Configure sampling rates**
   - Errors: 100% sampling (capture all errors)
   - Performance: 10% sampling (representative sample)
   - Session replay: 5% sampling (for debugging)
   - Adjust based on volume and costs
   - Higher sampling for specific error types

6. **Add privacy controls**
   - Respect Do Not Track (DNT) browser setting
   - Anonymize IP addresses
   - Exclude sensitive data from tracking (auth tokens, PII)
   - Add opt-out mechanism in user settings
   - Comply with GDPR/CCPA requirements
   - Display privacy policy with analytics disclosure

## Verification

- [ ] PostHog tracks key events successfully
- [ ] Events include custom properties (duration, format, device)
- [ ] User sessions are tracked and visible in PostHog
- [ ] Sentry captures errors with full context
- [ ] Performance metrics (Web Vitals) visible in Sentry
- [ ] Transaction performance tracked for key operations
- [ ] Sampling rates configured correctly (100% errors, 10% performance)
- [ ] DNT setting respected by tracking code
- [ ] IP addresses anonymized in analytics data
- [ ] Sensitive data excluded from tracking
- [ ] Users can opt out of analytics in settings
- [ ] Sentry errors linked to PostHog sessions for debugging

## Estimated Time
3 hours
