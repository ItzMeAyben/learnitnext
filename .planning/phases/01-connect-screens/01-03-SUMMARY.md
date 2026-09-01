---
phase: 01-connect-screens
plan: 3
subsystem: ui
tags: [nextjs, app-router, navigation, next-link, tanstack-query]

# Dependency graph
requires:
  - phase: baseline (pre-milestone scaffold)
    provides: existing screens, (dashboard) route group with TopNav chrome, /api/subjects endpoint, SUBJECTS store ids with spaces
provides:
  - "/subjects index screen (client, TanStack Query) listing every subject with encodeURIComponent detail links"
  - "TopNav Subjects tab wired to /subjects — all five primary destinations now reachable (FLOW-03)"
  - "Home dead spans converted to Links: Finance tile → /subjects, four fresh-material cards → subject/quiz/listen targets"
  - "Session entry point: 'Session view' white-pill Link in the Home header actions row (D-06 entry half)"
affects: [01-connect-screens plans 04-05, Phase 2 data wiring (DATA-*)]

# Tech tracking
tech-stack:
  added: []  # zero new dependencies — next/link + @tanstack/react-query only
  patterns:
    - "Client index screen: verbatim fetchSubjects + useQuery(['subjects']) from Today, Loading… gate before render"
    - "Featured hero card + row-card Links with encodeURIComponent(subject.id) hrefs (space-containing ids)"
    - "Dead span → styled Link conversion: identical inline styles plus textDecoration: 'none' (D-11 pixel-parity)"

key-files:
  created:
    - app/(dashboard)/subjects/page.js
  modified:
    - components/TopNav.js
    - app/(dashboard)/page.js

key-decisions:
  - "Subjects tab to: '/subjects' only — match predicate unchanged (already covers /subjects and /subjects/X)"
  - "Finance tile links to the subjects index: Finance is not in SUBJECTS and /subjects/Finance 404s after Plan 02, so the index is the correct non-dead target"
  - "FRESH_MATERIAL hrefs are literal pre-encoded strings (/subjects/AI%20Agents, /quiz?subject=AI%20Agents, /listen?subject=Sales) — Plan 04's URLSearchParams readers decode them; links landing first keep current defaults"
  - "Session entry placed as first item of Home header actions row, matching the existing white-pill idiom of 'Save a link'"

patterns-established:
  - "Index-of-entities screen inside the (dashboard) group inherits TopNav chrome with no URL prefix (route-groups convention)"
  - "Every dynamic subject href is built with encodeURIComponent; raw spaces in hrefs are eradicated from nav targets"

requirements-completed: [FLOW-03, FLOW-05]

# Metrics
duration: 6 min
completed: 2026-08-14
---

# Phase 01 Plan 3: Primary Navigation Skeleton Summary

**New /subjects index screen + TopNav/Home wiring: all five destinations reachable, Home's dead spans (Finance tile, fresh-material cards) are working Links, and /session gained a "Session view" entry**

## Performance

- **Duration:** 6 min
- **Started:** 2026-08-14T17:25:50Z
- **Completed:** 2026-08-14T17:31:23Z
- **Tasks:** 2
- **Files modified:** 3 (1 created, 2 modified)

## Accomplishments
- TopNav Subjects tab now targets `/subjects` (was hardcoded unencoded `/subjects/AI Agents`) — FLOW-03: all five destinations (Today /, Subjects /subjects, Listen /listen, Library /library, Pipeline /pipeline) reachable from global nav
- New `app/(dashboard)/subjects/page.js`: client index screen fetching `/api/subjects` via useQuery, first subject as featured hero card (no "New today" badge), remaining as row cards, every href encodeURIComponent-encoded, Loading… state — verified rendering `AI Agents`, `Distribution`, `Sales` data feed
- Home (`app/(dashboard)/page.js`): Finance tile row div → Link to `/subjects`; all four FRESH_MATERIAL cards → Links with encoded hrefs; "Session view" pill Link added to header actions — action controls ("Save a link", "Run now") left untouched as spans per D-05
- One of the codebase's two hardcoded `/subjects/AI Agents` hrefs eradicated (the other is Plan 04's quiz Exit)

## Task Commits

Each task was executed and verified atomically, but per project config (`commit_docs: false` — learnit is untracked in the shared parent monorepo), **commit skipped (commit_docs=false)** for both tasks and the plan metadata. All changes are left uncommitted in the working tree:

1. **Task 1: TopNav Subjects tab + subjects index screen** — no commit (commit_docs=false)
2. **Task 2: Home dead spans + Session entry** — no commit (commit_docs=false)

**Plan metadata:** no commit (commit_docs=false)

## Files Created/Modified
- `app/(dashboard)/subjects/page.js` - NEW subjects index screen at /subjects: useQuery fetch of /api/subjects, featured hero card + row cards, all hrefs via encodeURIComponent, Loading… state
- `components/TopNav.js` - Subjects tab entry changed to `to: '/subjects'` (single-line change; match predicate untouched)
- `app/(dashboard)/page.js` - Finance tile → Link href="/subjects"; FRESH_MATERIAL entries gained href fields and card renderer div → Link; "Session view" Link pill added to header actions

## Decisions Made
- Finance tile points at the subjects index (not /subjects/Finance) because Finance is not in SUBJECTS — after Plan 02 that detail URL 404s; the index is the non-dead target (per research inventory guidance)
- FRESH_MATERIAL hrefs are literal encoded strings rather than interpolations — the four values are static mock content, so encodeURIComponent is unnecessary; Plan 04 reads `?subject=` via URLSearchParams
- Session entry uses the Today header pill placement (planner discretion D-06), matching the existing white-pill idiom exactly

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- One verification shell invocation lost PATH (`curl`/`head` not found) mid-run; re-ran the walkthrough checks with `node -e` fetch instead — all checks passed. Environment quirk only, no project impact.

## User Setup Required

None - no external service configuration required.

## Known Stubs

None — the index screen is fully wired to `/api/subjects`; the Loading… state is a genuine client-fetch loading state, not a placeholder.

## Next Phase Readiness
- Ready for Plan 04 (study-loop wiring): the Home fresh-material cards already emit `/quiz?subject=AI%20Agents` and `/listen?subject=Sales` — Plan 04's readers land on working links
- Plan 04 also owns the remaining hardcoded `/subjects/AI Agents` href (quiz Exit, `app/(dashboard)/quiz/page.js:34`)
- Plan 05 (Library/Pipeline/Listen/Session dead spans) is unaffected by this plan; criterion-6 record re-verified this run: Library spans (lines 196-204: Search/Export/Save actions) and Pipeline spans (Schedule ▾ / Rename / Copy log + run control) are D-05-excluded action controls only — FLOW-05 criterion 6 satisfied vacuously

## Self-Check: PASSED

- Files exist: `app/(dashboard)/subjects/page.js` (created), `components/TopNav.js`, `app/(dashboard)/page.js` (modified), `01-03-SUMMARY.md`
- Criteria re-confirmed post-write: TopNav `to: '/subjects'` present (1), zero `AI Agents` remnants in TopNav, index `encodeURIComponent` count 2, Home `href="/session"` and `href="/subjects"` present
- Commits: N/A — commits disabled for this run (commit_docs=false; learnit untracked in parent monorepo); all changes left uncommitted in the working tree as instructed
- Off-limits files (lib/store.js, app/layout.js, app/onboarding/page.js, app/not-found.js) untouched — mtimes pre-date this run

---
*Phase: 01-connect-screens*
*Completed: 2026-08-14*
