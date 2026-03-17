# Task 21: Project Listing UI

## Objective
Project dashboard showing all user projects with create/open/delete actions.

## Context
Users need a landing page to browse their projects. Show grid of project cards with thumbnail, title, last modified date, and actions.

## Steps
1. Create `/projects` route as authenticated landing page
2. Fetch all projects for current user from GCS (list blobs with prefix `users/{userId}/projects/`)
3. Display project cards in grid: thumbnail, title, last modified, duration
4. Add "New Project" button to create blank project
5. Add "Open" button to load project into editor
6. Add "Delete" button with confirmation modal
7. Add search/filter by title and sort by date

## Verification
- Projects page displays all saved projects for user
- User can create new project from dashboard
- User can open existing project
- User can delete project with confirmation
- Search and sort work correctly

## Estimated
5 hours
