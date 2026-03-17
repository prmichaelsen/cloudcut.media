# Task 19: Authentication System

## Objective
Integrate Firebase Auth for user authentication (sign up, log in, log out) with session management.

## Context
Users need accounts to save projects. Firebase Auth provides OAuth, email/password, and session management out of the box.

## Steps
1. Install Firebase SDK and configure project
2. Create AuthContext with sign up/log in/log out methods
3. Build sign up form (email, password, confirm password)
4. Build log in form (email, password, forgot password link)
5. Add session management (JWT tokens, refresh on expiry)
6. Protect routes requiring auth (redirect to /login if unauthenticated)
7. Add logout button in header/menu

## Verification
- User can create account with email/password
- User can log in and session persists across page refresh
- User can log out and is redirected to login
- Protected routes redirect unauthenticated users

## Estimated
5 hours
