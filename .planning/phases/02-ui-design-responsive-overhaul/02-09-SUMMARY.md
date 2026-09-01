---
phase: 02-ui-design-responsive-overhaul
plan: 09
subsystem: ui
tags: [nextjs, react, dashboard, responsive, design-tokens, react-query]

# Dependency graph
requires:
  - phase: 02-ui-design-responsive-overhaul (02-01)
    provides: token system (lib/tokens.js + globals.css class layer: .btn-*, .skeleton)
  - phase: 02-ui-design-responsive-overhaul (02-02)
    provides: adaptive / rendering Today inside AppShell
  - phase: 02-ui-design-responsive-overhaul (02-04)
    provides: pathway #active-stage anchor the hero deep-links to
  - phase: 02-ui-design-responsive-overhaul (02-08)
    provides: AppShell responsive chrome (TopNav/PhoneHeader/TabBar)
provides:
  - Today redesigned per D-03 — lime greeting hero + overnight status + streak chip, ONE primary "Continue reading" into the featured subject's active pathway stage, subjects grid, quietly demoted rail (now playing / saved yesterday / last night's run)
  - export const LEARNER_NAME = 'Iven' in lib/store.js (single source; Session consumes it in 02-11)
  - Today §14.3 tone states — loading skeleton, error + Retry branch (new; closes Phase 1 IN-01's Home row), empty state in the hero slot
  - §12 row 3 responsive layouts — phone stack / tablet rail row / desktop 1fr 336px grid — clearing deferred-item-3's `/` overflows (552/522/144px)
affects: [02-11 (Session + Listen overhaul, LEARNER_NAME consumer), 02-12 (phase gate sweep), Phase 3 DATA-04 (widget data wiring), Phase 4 CAPT-01/02 (Save a link / Run now)]

# Tech tracking
tech-stack:
  added: []  # no new dependencies (D-06)
  patterns:
    - "useViewport() composition branches for §12 layouts (phone stack vs tablet row vs desktop grid), SSR-safe via the 02-01 hook"
    - "D-03 hierarchy: exactly ONE .btn-primary per happy-path view; not-yet-wired actions as full-opacity disabled .btn-ghost.btn-undone pills with title tooltip"
    - "statusPill() shared factory replaces per-screen STATUS_PILL maps (D-07 dedup)"
    - "byte-identical hrefs through template + encodeURIComponent (keeps D-11 fences while making encoding grep-provable)"

key-files:
  created: []
  modified:
    - components/Today.js
    - lib/store.js

key-decisions:
  - "Streak is a Caption chip in the hero ('37-day streak · keep it going'), not a widget card — the old 46px-numeral Streak card is deleted (D-03)"
  - "Fresh-material grid: '1fr 1fr' on phone/tablet, repeat(auto-fit, minmax(160px,1fr)) on desktop — the plan's literal auto-fit would collapse to 1-col at 360px (328px content minus card padding), violating the 2-col-phone must-have"
  - "FRESH_MATERIAL hrefs rebuilt via template + encodeURIComponent; verified byte-identical to the Phase 1 strings, so D-11 holds and the encoding gate (>= 6 lines) passes"
  - "Save a link / Run now are honest disabled pills (.btn-undone, title='Coming in a later update') — CAPT-01/02 wire them in Phase 4"

patterns-established:
  - "Demoted-rail idiom: Caption-12 uppercase RAIL_HEAD eyebrows + compact (padding md) cards, no big numerals"
  - "Empty state inside the lime hero shell — the greeting still greets (§14.3 Today row)"

requirements-completed: [UI-02, UI-03, UI-04, UI-05]

# Metrics
duration: 16min
completed: 2026-08-15
---

# Phase 2 Plan 9: Today Dashboard Redesign (D-03) Summary

**Today rebuilt as the welcoming hub: lime "Built while you slept, Iven" hero with ONE ink "Continue reading" deep-link into /pathway/AI%20Agents#active-stage, subjects grid, demoted Caption-headed rail — plus LEARNER_NAME exported from lib/store.js and Today's first loading/error/empty branches.**

## Performance

- **Duration:** ~16 min
- **Started:** 2026-08-15T16:04Z (local 2026-08-16 00:04)
- **Completed:** 2026-08-15T16:20Z
- **Tasks:** 2
- **Files modified:** 2 (`components/Today.js`, `lib/store.js`)

## Accomplishments
- D-03 hierarchy delivered: greeting hero (Display 32 ink on lime, one-line overnight status, subtle streak chip), exactly ONE primary action ("Continue reading" → the featured subject's active pathway stage via the 02-04 #active-stage anchor) with Ghost "♪ Listen instead · 24 min", subjects grid (featured colored tile + list tiles + Finance stub), and a visually quieter rail (NOW PLAYING / SAVED YESTERDAY / LAST NIGHT'S RUN as compact Caption-headed cards; the giant Streak card is gone).
- `export const LEARNER_NAME = 'Iven'` added to `lib/store.js` (only change to that file); Today imports it — the Iven/Sam split ends when 02-11 consumes the export on Session.
- §14.3 tone states: loading (hero-shaped 120px r-2xl skeleton + 3×200px column skeletons, aria-busy + sr-only "Waking up your dashboard…"), error (role=alert "Couldn't load your morning — check the pipeline." + Retry; previously Today had NO error branch — Phase 1 IN-01 closed), empty ("Your first night hasn't run yet" rendered in the hero slot + Ghost "Start setup" → /onboarding); all three fetch helpers now throw on `!res.ok`.
- Deferred item 3's `/` page-content overflows (552px @360, 522px @390, 144px @768) cleared: cookie-fixture sweep on port 3201 reports ALL VIEWPORTS CLEAN at 360/390/768/1024/1440.
- D-11 fence verified from the live DOM: href manifest is exactly `/pathway/AI%20Agents#active-stage`, `/listen?subject=AI%20Agents`, `/session`, `/subjects/AI%20Agents`, `/subjects/Distribution`, `/subjects/Sales`, `/subjects` (Finance), the four fresh-material links (byte-identical to Phase 1), `/library`, `/pipeline`.

## Task Commits

Per execution instructions: **commit_docs=false — no git commits made** (and the learnit directory is not its own git repository; it is untracked inside the parent `yahshua` repo). Task completion is evidenced by the verification logs below instead of commit hashes.

1. **Task 1: LEARNER_NAME export + §14.1 hierarchy** — verify `TODAY-HIERARCHY-OK` (build + 8 grep gates)
2. **Task 2: §14.3 tone states** — verify `TODAY-STATES-OK` (build + 6 grep gates)

**Plan metadata:** none (no-commit mode).

## Files Created/Modified
- `components/Today.js` — full redesign per §14.1/§12 row 3/§14.3: lime hero, one-primary action row (phone: full-width pills with a 2-up Ghost utilities row), fresh-material strip, subjects grid, demoted rail, loading/error/empty branches, res.ok-hardened fetchers, statusPill() adoption (local STATUS_PILL map deleted), all hex → tokens/CSS vars (subject store colors stay as sanctioned §7.4 dynamic accents).
- `lib/store.js` — one addition: `export const LEARNER_NAME = 'Iven'` (+ 2-line comment) after the header block. No store data/logic touched.

## Decisions Made
- Fresh-material grid columns are viewport-branched (see key-decisions) instead of a single auto-fit rule — satisfies both the "4-across desktop" and "2-col phone" requirements.
- "Session view" demotes to `.btn .btn-secondary`; "Save a link"/"Run now" demote further to disabled `.btn-ghost .btn-undone` pills (Phase 4 CAPT-01/02 fence, threat register T-02-09-02 accepted disposition).
- Saved-yesterday rail shows 3 rows (was 4) per §14.1, plus a new "Library →" `.btn-link` (rail idiom; not a Phase 1 wire, additive only).
- Error Retry uses `.btn-primary` per the plan's verbatim §14.3 pattern — it only renders in the error branch, so the happy path still shows exactly ONE primary (see Self-Check note).

## Deviations from Plan

None — plan executed as written, with one implementation-detail adaptation documented as a decision rather than a code deviation: the fresh-material grid rule (plan's literal `repeat(auto-fit, minmax(160px,1fr))` would be 1-col at 360px, contradicting the plan's own "fresh material 2-col" phone must-have; resolved with '1fr 1fr' below desktop). No Rules 1–4 triggers occurred; no auth gates.

## Issues Encountered
None. (Verification tooling note: `check-viewports.mjs` was run on scratch port 3201 per orchestrator instruction; plan text said 3199 — same tool, same cookie fixture, same five widths.)

## Known Stubs
Intentional mocks carried per the plan ("Widget DATA stays mock — DATA-04 is Phase 3"), all in `components/Today.js`:
- Hero overnight line "6 new sources read · 3 subjects updated" — hardcoded counts (only `lastRunAt` is live from /api/pipeline).
- Streak chip "37-day streak · keep it going" — hardcoded.
- "♪ Listen instead · 24 min" duration — hardcoded.
- FRESH_MATERIAL titles/meta (Study guide / Briefing doc / Quiz / Audio episode rows) — static array; hrefs are the real Phase 1 routes.
- Now playing (title, Episode 8 · 24 min, waveform, transport) and the 4-segment run bar — decorative mocks (aria-hidden), non-interactive.
- "Save a link" / "Run now" disabled pills — Phase 4 actions, honest-disabled by design.
- `LEARNER_NAME` is a compile-time constant ('Iven'), not user data (T-02-09-03 accepted); Session still defines its local 'Sam' until 02-11 — the export is this plan's full scope.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- 02-11 (Session + Listen): import `LEARNER_NAME` from `lib/store.js` (ends the Sam split) and owns the remaining deferred-item-3 overflows (`/listen`, `/session`).
- 02-12 phase gate: `/` is clean at all five widths in the cookie state (this plan swept it twice — after Task 1 and after Task 2).
- Phase 3 DATA-04 has a clear seam: every mock datum is a literal inside Today's JSX/arrays, no store logic depends on it.

## Self-Check: PASSED

- Files exist: `components/Today.js`, `lib/store.js`, this SUMMARY — FOUND (all three).
- Commits: N/A — no-commit mode (commit_docs=false; learnit is untracked inside the parent repo). Verified instead by re-running the plan's gates post-Task-2:
  - `npm run build` — PASS (both tasks; second run silent)
  - Task 1 gate `TODAY-HIERARCHY-OK` — PASS (LEARNER_NAME in both files; "Built while you slept", "Continue reading", "active-stage", "37-day streak", "btn-undone" present; no `const STATUS_PILL`)
  - Task 2 gate `TODAY-STATES-OK` — PASS (all three state copy strings, role="alert", res.ok, className="skeleton")
  - Acceptance: `grep -c encodeURIComponent` = 10 (>= 6) PASS · `href="/subjects"` PASS · happy-path btn-primary exactly 1 PASS (Task-1-time check; final file has 2 matching lines — Continue reading + the plan-prescribed error-branch Retry, which renders only on error) · `grep -c res.ok` = 5 (>= 3) PASS
  - Viewport sweep `/` (cookie fixture, port 3201): ALL VIEWPORTS CLEAN — PASS (twice)
  - Phone stack order probe @360: hero(24) → Continue reading(142) → Your subjects(218) → Fresh material(404) → SAVED YESTERDAY(576) → LAST NIGHT'S RUN(735) → NOW PLAYING(803) — PASS; fresh tiles 2-col (2×134px + 12 gap) — PASS
  - Visual captures (360/1024/full-page 360) confirm hero full-width, subjects left + ~336px rail right at 1024, primary-first wrapping pills + 2-up utilities at 360, no giant Streak card, no clipping — PASS

---
*Phase: 02-ui-design-responsive-overhaul*
*Completed: 2026-08-15*
