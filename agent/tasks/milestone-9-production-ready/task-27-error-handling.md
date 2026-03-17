# Task 27: Error handling

## Objective
Error boundaries, retry logic, user-friendly error messages, Sentry integration.

## Context
Production apps need robust error handling to prevent crashes and aid debugging. Provide users with clear feedback when errors occur and give developers the tools to diagnose and fix issues quickly.

## Steps

1. **Add React error boundaries at route level**
   - Create ErrorBoundary component to catch React errors
   - Wrap each route with error boundary
   - Display fallback UI when error caught
   - Add "reload page" button in error UI
   - Log error details to console in development

2. **Integrate Sentry for error reporting**
   - Install and configure Sentry SDK
   - Set up error tracking for production environment
   - Configure source maps for readable stack traces
   - Add user context (user ID, session ID) to error reports
   - Set up release tracking for version-specific errors

3. **Implement retry logic for network requests**
   - Add retry wrapper for fetch calls
   - Implement exponential backoff (1s, 2s, 4s, 8s)
   - Max 3 retry attempts before failing
   - Different retry strategies for different error types (network vs. server errors)
   - Cancel retries on user navigation away from page

4. **Create error toast component with user-friendly messages**
   - Build toast notification component for errors
   - Map technical errors to user-friendly messages
   - Categorize errors (network, server, client, permission)
   - Add error icon and appropriate styling
   - Auto-dismiss non-critical errors after 5 seconds

5. **Add error recovery actions**
   - Reload page button for fatal errors
   - Retry button for failed operations
   - Contact support link with pre-filled error details
   - Export project data button for data recovery
   - Clear cache option for persistent errors

6. **Log errors appropriately by environment**
   - Development: log full error details to console
   - Production: send to Sentry with sanitized data
   - Remove sensitive information (auth tokens, PII) from logs
   - Add breadcrumbs for debugging (user actions, network calls)

## Verification

- [ ] Error boundaries catch React errors without crashing app
- [ ] Fallback UI displays when error caught
- [ ] Errors are reported to Sentry in production
- [ ] Source maps allow readable stack traces in Sentry
- [ ] Network requests retry with exponential backoff
- [ ] User sees friendly error messages (not technical jargon)
- [ ] Error toasts display for non-fatal errors
- [ ] Recovery actions (reload, retry) work correctly
- [ ] Contact support link includes error details
- [ ] Sensitive information is removed from error logs
- [ ] Breadcrumbs provide context for debugging
- [ ] Development logs show full error details

## Estimated Time
4 hours
