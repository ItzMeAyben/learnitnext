# LearnIt

## What This Is

A personal "build your own Coursera" web app (spec: *Build Your Own Coursera*,
angussewell.com — see `.planning/SPEC-Build-Your-Own-Coursera.md`). The user
saves links (YouTube playlist, Telegram bot, browser extension, SMS); links
land in a single library table; an overnight pipeline fetches transcripts,
sorts them into subjects, and builds course material (study guide, briefing
doc, quiz) per subject; a digest tells the user what landed.

The app is a Next.js 16 UI over that concept. All screens exist as a
design-complete mock over an in-memory store (`lib/store.js`). This milestone
connects the screens into a working user flow.

## Core Value

Save a link today, wake up to course material tomorrow — and every screen in
that loop is reachable and one click away.

## Current State

- **Stack:** Next.js 16.3.1 (App Router, JavaScript, no TypeScript, no
  Tailwind — inline `style` props), React 19, TanStack Query + Table.
  ⚠ AGENTS.md: this Next version has breaking changes — read
  `node_modules/next/dist/docs/` before writing code.
- **Screens built:** onboarding, today (home), library, pipeline, subjects
  detail, pathway, quiz, listen, session (alt home), pathway print.
- **Data:** in-memory mock store + REST-ish API routes
  (`/api/library`, `/api/subjects`, `/api/pipeline`, `/api/webhook`).
- **Gap:** screens are visually complete but navigation is largely
  non-functional (dead spans, orphan screens, hardcoded IDs).

## Requirements

### Active

See `.planning/REQUIREMENTS.md` (FLOW-01..06 are this milestone's scope).

### Out of Scope

- Real integrations (Baserow, Telegram, Firecrawl, Gemini Notebook) — spec
  Setup steps, external to this app
- Audio playback engine behind the Listen waveform
- Scheduling/cron, auth, multi-user
