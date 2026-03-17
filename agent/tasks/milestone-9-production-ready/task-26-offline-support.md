# Task 26: Offline support

## Objective
Local-first EDL storage with sync on reconnect, service worker for offline assets.

## Context
Users editing on mobile need offline resilience. Store EDL in IndexedDB, sync to GCS when online. Ensure users can continue working during temporary network interruptions without losing data.

## Steps

1. **Create IndexedDB schema for projects**
   - Define schema for projects table (id, name, edl, metadata, created, modified)
   - Add sync status fields (lastSyncedAt, pendingChanges, syncError)
   - Create indexes for efficient querying
   - Implement schema versioning for future migrations

2. **Implement local-first save**
   - Write to IndexedDB immediately on every edit
   - Queue GCS sync operations in background
   - Update UI immediately without waiting for network
   - Add debouncing to prevent excessive sync attempts

3. **Build sync manager**
   - Detect online/offline status using navigator.onLine and network events
   - Queue pending changes when offline
   - Sync pending changes automatically when reconnecting
   - Implement exponential backoff for failed syncs

4. **Add service worker to cache app shell and UI assets**
   - Register service worker for offline caching
   - Cache app shell (HTML, CSS, JS bundles)
   - Cache static assets (icons, fonts, UI images)
   - Implement cache-first strategy with network fallback

5. **Show offline indicator in UI**
   - Add status indicator showing online/offline state
   - Display sync status (synced, syncing, pending changes)
   - Show warning when offline with pending changes
   - Add manual "sync now" button

6. **Handle sync conflicts**
   - Detect conflicts when local and remote versions differ
   - Implement last-write-wins strategy by default
   - Optionally prompt user to resolve conflicts manually
   - Preserve conflict versions for recovery

## Verification

- [ ] App loads and displays UI when offline
- [ ] User can open and edit projects when offline
- [ ] Changes are saved to IndexedDB immediately
- [ ] Offline indicator shows current network status
- [ ] Changes sync to GCS when connection restored
- [ ] Service worker caches app shell and assets
- [ ] App loads from cache when offline
- [ ] No data loss occurs during offline sessions
- [ ] Sync conflicts are detected and handled
- [ ] Manual "sync now" button triggers immediate sync
- [ ] Sync errors display user-friendly messages

## Estimated Time
6 hours
