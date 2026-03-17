# Milestone 7: Project Persistence & Auth

## Goal

Enable users to save their editing projects, authenticate, and load projects across sessions. This milestone establishes the foundation for multi-session workflows and user accounts.

## Overview

After M1-M6, users can edit and export videos but lose all work when they close the browser. M7 adds project persistence (save/load EDL + metadata to GCS), authentication (Firebase Auth or equivalent), and basic user account management. This enables users to return to their projects later, share projects (future), and prevents data loss.

## Deliverables

- User authentication system (sign up, log in, log out) with session management
- Project save/load functionality — persist EDL JSON and project metadata to user-scoped GCS buckets
- Project listing UI — view all saved projects, create new, delete old
- Auto-save mechanism — periodically save project state in background

## Success Criteria

- Users can create an account and log in with email/password
- Users can save a project (EDL + metadata) and see it appear in their project list
- Users can load a previously saved project and resume editing where they left off
- Projects auto-save every 30 seconds to prevent data loss
- User data is isolated per account (no cross-user access)

## Architectural Considerations

**Plugin Extension Points**: When building the persistence layer, design with extensibility:
- **Storage Providers**: Built-in GCS storage should register via the same interface third-party storage providers (Dropbox, S3) will use later
- **Project Format**: EDL schema should be versioned and documented for plugin compatibility
- **Auth Providers**: Firebase Auth is baseline, but support OAuth providers (Google, GitHub) via adapter pattern

See `agent/design/local.plugin-architecture.md` for extension point patterns.

## Tasks

1. [task-19-authentication-system](../tasks/milestone-7-project-persistence-auth/task-19-authentication-system.md) — Firebase Auth integration with sign up/log in/log out flows
2. [task-20-project-save-load](../tasks/milestone-7-project-persistence-auth/task-20-project-save-load.md) — Save/load EDL + metadata to user-scoped GCS buckets
3. [task-21-project-listing-ui](../tasks/milestone-7-project-persistence-auth/task-21-project-listing-ui.md) — Project dashboard showing all user projects with create/open/delete actions
4. [task-22-auto-save](../tasks/milestone-7-project-persistence-auth/task-22-auto-save.md) — Background auto-save every 30s with visual indicator
