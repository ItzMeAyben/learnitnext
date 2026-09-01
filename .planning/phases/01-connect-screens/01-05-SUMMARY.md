---
phase: 01-connect-screens
plan: 5
subsystem: ui
tags: [nextjs, app-router, client-notfound, usequery, next-link, encodeuricomponent, scrollintoview, breadcrumbs]

# Dependency graph
requires:
  - phase: 01-connect-screens (Plan 01-02, server correctness)
    provides: "GET /api/subjects/[id] 404 contract ({ error: 'Subject not found' }) and root app/not-found.js screen that this plan's client 404 surfacing verifies against"
  - phase: 01-connect-screens (Plan 01-04, subject context)
    provides: "/quiz and /listen ?subject= context handling that this plan's launchers (Retake / ♪ Listen / ♪ Switch to Listen) feed"
  - phase: 01-connect-screens (Plan 01-03, subjects index)
    provides: "/subjects index that both pages' breadcrumbs return to"
provides:
  - "Subject hub launches its study loop with encoded subject context: Continue/Read again -> /pathway/{id}, ♪ Listen -> /listen?subject={id}, Retake/Review misses -> /quiz?subject={id}"
  - "Pathway breadcrumbs back to /subjects index and to its owning subject (/subjects/{id})"
  - "Pathway '♪ Switch to Listen' hop carrying subject context; 'Continue where you left off' and the active-stage 'Continue' pill smooth-scroll to the active stage (id=active-stage); done-stage 'Review' pill opens /quiz?subject={id}"
  - "Client-side 404 surfacing on both dynamic client pages: unknown or malformed ids render the not-found screen (never AI Agents fallback, never eternal Loading…)"
  - "All dynamic hrefs on both pages built with encodeURIComponent (subject page x6, pathway page x5 — incl. the previously unencoded print link and subject chips)"
affects: [Phase 2 Live Data Wiring (SOURCE_ROWS mock on the subject page is DATA-01), Phase 2 DATA-02 (per-subject quiz content)]

# Tech tracking
tech-stack:
  added: []  # zero new dependencies — next/link, next/navigation notFound, TanStack Query, DOM scrollIntoView only
  patterns:
    - "Client 404 surfacing: queryFn returns null on res.status === 404 (never calls notFound() inside queryFn); render-path guard `if (!name || subject === null) notFound()` placed AFTER all hooks"
    - "List-resolved 404 guard for find()-based lookups: `if (!name || (subjects && !subject)) notFound()` — list resolved but id absent -> not-found; list pending -> Loading"
    - "Safe decode: decodeURIComponent(params value) wrapped in try/catch -> '' -> notFound() (malformed % ids render 404, never a URIError crash)"
    - "In-page jump via onClick + getElementById().scrollIntoView({ behavior: 'smooth' }) instead of <a href=\"#...\"> (hash href would trigger a route transition)"

key-files:
  created: []
  modified:
    - app/(dashboard)/subjects/[subjectId]/page.js
    - app/(dashboard)/pathway/[subjectId]/page.js

key-decisions:
  - "notFound() called in the render path (never inside queryFn — TanStack Query swallows thrown errors into error state); subject === null distinguishes resolved-404 from undefined-while-loading"
  - "Research assumption A1 confirmed empirically: a client-thrown notFound() DOES render the root not-found boundary post-hydration (h1 'Nothing here' in headless Chrome on /subjects/DoesNotExist and /pathway/DoesNotExist) — the plan's in-page fallback card was not needed"
  - "'Read again' (briefing) links to the pathway and stage 'Review' pill to /quiz?subject={id}, per the plan's inventory discretion"
  - "Print/chips Links keep their pre-existing styles (only hrefs got encodeURIComponent) — they were already Links; Switch to Listen got the plan-specified pill styles + textDecoration none"

patterns-established:
  - "Pattern: client dynamic page 404 = safe-decode try/catch + status-404-null queryFn + render-path notFound() after hooks (subject page variant: per-id fetch; pathway variant: list fetch + find)"
  - "Pattern: launcher hrefs always `/dest/${encodeURIComponent(subject.id)}` or `/dest?subject=${encodeURIComponent(subject.id)}`"

requirements-completed: [FLOW-04, FLOW-05, FLOW-06]  # FLOW-04 end-to-end (launchers from 01-05 + context handling from 01-04); FLOW-05 Subject+Pathway portion (other screens completed in 01-03/01-04); FLOW-06 client half (server half in 01-02)

# Metrics
duration: 11min
completed: 2026-08-14
---

# Phase 1 Plan 5: Study-Loop Hub Wiring Summary

**Subject page launches pathway/quiz/listen with encoded subject context, pathway gains breadcrumbs + Switch-to-Listen + active-stage smooth-scroll jump, and both client pages surface not-found for unknown/malformed ids against Plan 02's 404 API contract**

## Performance

- **Duration:** ~11 min (2026-08-14T17:46:11Z → 17:56:59Z UTC, plus summary)
- **Started:** 2026-08-14T17:46:11Z
- **Completed:** 2026-08-14T17:56:59Z
- **Tasks:** 2
- **Files modified:** 2 (both listed in the plan's files_modified; no other files touched)

## Accomplishments
- Subject hub loop launchers all carry subject context: Continue + Read again -> `/pathway/Distribution`, ♪ Listen -> `/listen?subject=Distribution`, Retake + Review misses -> `/quiz?subject=Distribution` (verified live by clicking every link)
- The full FLOW-04 loop closes end-to-end in a real browser: subject -> Continue -> pathway (same subject) -> ♪ Switch to Listen -> `/listen?subject=Distribution` (episode card reads Distribution) -> back -> Retake -> `/quiz?subject=Distribution` -> Exit -> `/subjects/Distribution` with the Distribution header
- Unknown and malformed ids render the styled not-found screen on both pages (post-hydration soft 404): `/subjects/DoesNotExist`, `/pathway/DoesNotExist`, `/subjects/%25` all show h1 "Nothing here", never AI Agents, never an eternal Loading… — the pathway page previously loaded forever for unknown ids
- "Continue where you left off" and the active-stage "Continue" pill smooth-scroll to the active stage card (`id="active-stage"`, verified scrollY 0 -> 257); done-stage "Review" pill links to the subject quiz; ▲/▼ reorder untouched
- All dynamic hrefs on both pages are encoded, including the previously unencoded print link and pathway subject chips (`/pathway/AI%20Agents` now renders correctly in href attributes)

## Task Commits

Commits are disabled for this project (`commit_docs: false`; learnit is untracked inside the shared `yahshua` monorepo). All changes are left uncommitted in the working tree as instructed.

1. **Task 1: Subject page — loop launchers, breadcrumb, 404 surfacing** — commit skipped (commit_docs=false)
2. **Task 2: Pathway page — breadcrumbs, encoded hrefs, listen hop, active-stage jump, 404 surfacing** — commit skipped (commit_docs=false)

## Files Created/Modified
- `app/(dashboard)/subjects/[subjectId]/page.js` — safe decode (try/catch), fetchSubject returns null on 404 status, `if (!name || subject === null) notFound()` after the useQuery hook; breadcrumb "Subjects" + five dead spans converted to encoded Links (Continue, ♪ Listen, Read again, Retake context, Review misses); Rename / Open in Gemini Notebook ↗ / Rebuild material and SOURCE_ROWS untouched
- `app/(dashboard)/pathway/[subjectId]/page.js` — safe decode, `if (!name || (subjects && !subject)) notFound()` replaces the eternal-Loading guard; breadcrumbs to `/subjects` and `/subjects/{id}`; print + chips hrefs encoded; "♪ Switch to Listen" -> `/listen?subject={id}`; "Continue where you left off" + active-stage "Continue" pill scroll to `#active-stage`; done-stage "Review" pill -> `/quiz?subject={id}`; stage reorder, checklist rows, "This stage builds from" panel, certificate card untouched

## Decisions Made
- Followed the plan's client not-found pattern verbatim (null-marker queryFn + render-path notFound()); A1 (client notFound() renders the boundary) was confirmed live, so the plan's fallback in-page not-found card was unnecessary
- Kept print/chips pill styles byte-identical and only encoded their hrefs (they were already Links); new Links got `textDecoration: 'none'` matching the existing "View pathway" idiom
- Verified visually via screenshots + image analysis that all converted controls render identically (D-11): clean pills, no underlines, no layout shifts on either page

## Deviations from Plan

### Documented Deviations

**1. [Acceptance-criterion typo, not a code change] Task 2 criterion grep `(subjects && !subject) notFound()` cannot match the plan's own prescribed code**
- **Found during:** Task 2 verification
- **Issue:** The criterion's literal grep string omits one closing paren. The plan's action snippet specifies `if (!name || (subjects && !subject)) notFound()` (two closing parens — one for the group, one for the `if`); a file matching the one-paren grep string would be a syntax error.
- **Resolution:** Implementation matches the plan's action snippet exactly; `grep "(subjects && !subject)) notFound()"` matches at line 48, placed after all hooks (useParams line 37, useQuery line 44, useState line 46). Criterion intent verified.
- **Files modified:** none

**2. [Procedural] Runtime verification used headless Chrome (agent-browser) against PORT=3126, and required setting the onboarding flag first**
- **Detail:** Per coordinator instructions the dev server ran on port 3126 (not 3000). A fresh headless browser was redirected to `/onboarding` by Plan 01-01's OnboardingGate (localStorage flag absent) — the gate working as designed — so `learnit_onboarded` was set in localStorage before loading dashboard pages. All in-browser criteria (soft 404s, link hrefs, scroll behavior, loop walkthrough) were verified with real clicks/eval in that session; the session and dev server were closed afterward.

---

**Total deviations:** 1 criterion-string typo (documented; no code impact) + 1 procedural note
**Impact on plan:** None — all acceptance criteria verified as intended.

## Issues Encountered
None. `npm run build` passed on the first run after each task; no code fixes were needed.

## Known Stubs
- `SOURCE_ROWS` mock table on `app/(dashboard)/subjects/[subjectId]/page.js` (sources list) — intentional per plan ("SOURCE_ROWS mock stays — DATA-01 is Phase 2"); does not affect this plan's navigation/404 goals.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 1 (connect-screens) is complete: this was the last plan (5 of 5). FLOW-04/05/06 all closed — every navigation-labeled control across the app is a working link, subject context flows through the whole study loop, and unknown ids 404 on server and client alike.
- Known intentional mocks deferred to Phase 2: SOURCE_ROWS (subject page, DATA-01), static QUIZ_ITEMS (quiz screen, DATA-02, per 01-04).

## Verification Log (plan-level `<verification>` + per-task criteria)

- `npm run build` exits 0 (run after each task; all routes present)
- Task 1 greps: `encodeURIComponent(subject.id)` count = 6 (>= 5); notFound guard at line 34 after useQuery (line 29); try/catch decode confirmed; "Rename" still a `<span`; all automated greps (notFound, status === 404, listen?subject=, quiz?subject=, href="/subjects") pass
- Task 2 greps: `encodeURIComponent` count = 5 (>= 4); zero unencoded `/pathway/${s.id|subject.id}` template hrefs; guard at line 48 after all hooks (see Deviation 1 for the criterion's one-paren typo); `active-stage` count = 3; moveStage/▲ logic unchanged; all automated greps pass
- API contract re-confirmed on the dev server: `/api/subjects/Distribution` -> 200; `/api/subjects/DoesNotExist` -> 404 `{"error":"Subject not found"}`; `/api/subjects/%25` -> 404
- In-browser (headless Chrome, port 3126):
  - `/subjects/Distribution` renders h1 "Distribution" (no AI Agents); launcher links live-verified: Continue -> `/pathway/Distribution`, ♪ Listen -> `/listen?subject=Distribution`, Read again -> `/pathway/Distribution`, Retake + Review misses -> `/quiz?subject=Distribution`, breadcrumb Subjects -> `/subjects`
  - `/subjects/DoesNotExist` -> h1 "Nothing here" post-hydration, no AI Agents, no eternal Loading, "Back to Today"/"Browse subjects" links present (A1 confirmed)
  - `/subjects/%25` -> h1 "Nothing here" (URIError caught; no crash)
  - `/pathway/Distribution` renders h1 "Distribution"; breadcrumb Subjects -> `/subjects` and Distribution -> `/subjects/Distribution`; print -> `/pathway/Distribution/print`; Switch to Listen -> `/listen?subject=Distribution`; chips encoded (`/pathway/AI%20Agents`); Review pill -> `/quiz?subject=Distribution`; `#active-stage` card present with the active border
  - `/pathway/DoesNotExist` -> h1 "Nothing here" (was eternal Loading… before this plan)
  - "Continue where you left off" click: scrollY 0 -> 257, active card scrolled into view; active-stage "Continue" pill: same scroll behavior
  - Loop walkthrough (real clicks): Continue -> `/pathway/Distribution`; Switch to Listen -> `/listen?subject=Distribution` (episode header reads "Memory, tools and the week-two failure", body carries Distribution); Retake -> `/quiz?subject=Distribution`; Exit -> `/subjects/Distribution` (h1 Distribution)
- D-11 visual check via screenshots + image analysis: both pages render cleanly (pills without underlines, breadcrumbs clean, stage cards/chips intact, no layout glitches)

## Self-Check: PASSED

- Files exist on disk: `app/(dashboard)/subjects/[subjectId]/page.js`, `app/(dashboard)/pathway/[subjectId]/page.js` — verified via reads/edits during execution
- Commits: none expected (commit_docs=false; all changes intentionally left uncommitted in the working tree)
- No modifications to STATE.md, ROADMAP.md, REQUIREMENTS.md, or other plans' files_modified (01-01..01-04 files untouched)

---
*Phase: 01-connect-screens*
*Completed: 2026-08-14*
