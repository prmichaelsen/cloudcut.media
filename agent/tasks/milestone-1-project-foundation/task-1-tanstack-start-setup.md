# Task 1: TanStack Start Setup

## Objective

Initialize a TanStack Start project with TypeScript, Tailwind CSS, basic routing, and a working dev server.

## Context

TanStack Start is the full-stack framework for this project. It provides file-based routing, SSR, and server functions. Tailwind handles styling. This task produces the skeleton that all subsequent work builds on.

## Steps

1. Scaffold a new TanStack Start project using the latest starter template (`npm create @tanstack/start@latest`). Choose TypeScript when prompted.
2. Install and configure Tailwind CSS v4 (or latest) with the TanStack/Vite pipeline. Add the Tailwind directives to the global CSS file.
3. Set up the root layout (`app/routes/__root.tsx`) with an `<html>`, `<head>`, and `<body>` shell. Include the Tailwind stylesheet.
4. Create an index route (`app/routes/index.tsx`) that renders a placeholder landing page.
5. Create a second route (`app/routes/editor.tsx`) as a stub for the future timeline editor page.
6. Verify `npm run dev` starts Vite, serves the app on localhost, and both routes are reachable.
7. Add basic ESLint and Prettier configs aligned with the TypeScript + React stack.

## Verification

- [ ] `npm run dev` starts without errors
- [ ] Navigating to `/` renders the landing page with Tailwind styles applied
- [ ] Navigating to `/editor` renders the editor stub page
- [ ] TypeScript compilation passes with no errors (`npx tsc --noEmit`)
- [ ] Tailwind utility classes (e.g., `bg-blue-500`) render correctly in the browser
