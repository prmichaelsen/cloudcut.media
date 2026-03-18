# Task 19: Authentication System

## Objective
Integrate Firebase Auth for user authentication (sign up, log in, log out) with server-side token verification in Cloudflare Workers, per-user R2 media isolation, and CORS lockdown.

## Context
The backend API routes (`/api/*`) in `src/server.ts` were previously open to anyone. Firebase Auth provides OAuth and email/password auth on the client side, while jose-based JWT verification secures the Worker endpoints. Media uploads are scoped per-user (`videos/{userId}/...`) so users can only access their own files.

## Steps
1. Install Firebase Client SDK and jose JWT library
2. Create Firebase client config and auth instance (`src/lib/auth/firebase-config.ts`, `firebase-client.ts`)
3. Create server-side token verification using jose (`src/lib/auth/verify-token.ts`)
4. Create React AuthContext and AuthProvider (`src/lib/auth/auth-context.tsx`)
5. Create authenticated fetch helper (`src/lib/auth/authenticated-fetch.ts`)
6. Build login page with Google OAuth + email/password (`src/routes/login.tsx`)
7. Add auth middleware to all `/api/*` routes in `src/server.ts`
8. Scope R2 uploads per user: `videos/{userId}/{timestamp}-{filename}`
9. Verify R2 media access: users can only read their own media keys
10. Lock down CORS to production domains + localhost
11. Support `?token=` query param for `<video>` element auth (can't send headers)
12. Add `/api/me` endpoint for user info
13. Protect `/editor` route with auth redirect to `/login`
14. Add Cloudflare Workers types for R2Bucket
15. Update `.env.example` with Firebase config vars

## Verification
- [x] TypeScript compilation passes (`npx tsc --noEmit`)
- [x] Vite build succeeds (client + SSR)
- [ ] User can sign in with Google OAuth
- [ ] User can sign in with email/password
- [ ] User can create account with email/password
- [ ] Unauthenticated requests to `/api/*` return 401
- [ ] Upload scopes to `videos/{userId}/...`
- [ ] User cannot access another user's media (403)
- [ ] `/editor` redirects to `/login` when unauthenticated
- [ ] Video playback works with `?token=` query param
- [ ] CORS rejects requests from unauthorized origins

## Estimated
5 hours

## Design Reference
[Firebase Authentication Pattern](../../patterns/tanstack-cloudflare.firebase-auth.md)
