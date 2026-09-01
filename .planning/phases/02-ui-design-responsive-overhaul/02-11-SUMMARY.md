---
phase: 02-ui-design-responsive-overhaul
plan: 11
subsystem: ui
tags: [responsive, design-tokens, nextjs, react, a11y]

# Dependency graph
requires:
  - phase: 02-ui-design-responsive-overhaul plan 01
    provides: lib/tokens.js token map, pill()/card()/statusPill() factories, useViewport hook, globals.css class layer
  - phase: 02-ui-design-responsive-overhaul plan 08
    provides: components/TabBar.js (self-hiding phone bottom bar, Pattern 4 placement)
  - phase: 02-ui-design-responsive-overhaul plan 09
    provides: lib/store.js LEARNER_NAME ('Iven') — the D-03 single name source
provides:
  - tokens.listenLight / tokens.listenDark §7.5 palette pairs (additive to the 02-01 contract)
  - Responsive /listen — phone pane stacking (D-05), tokenized theme toggle, a11y'd transport, TabBar on phone
  - Responsive /session — rail retires for the TabBar on phone, LEARNER_NAME greeting, shelf 4→2-col, §14.3 states
  - Deferred item 3 cleared: /listen and /session overflow at 360–768 eliminated (sweep clean 360–1440)
affects: [02-12-phase-gate, phase-3-data-wiring, phase-4-capture]

# Tech tracking
tech-stack:
  added: []   # zero new dependencies (D-06)
  patterns:
    - "Pattern 4 placement outside the (dashboard) group: screens with own chrome render <TabBar/> as the LAST tree element + phone bottom clearance calc(72px + env(safe-area-inset-bottom))"
    - "§7.5 token-pair theme toggle: const palette = isDark ? tokens.listenDark : tokens.listenLight (pairs reference §7.2 names, no hex duplication)"
    - "Loading state that keeps static chrome in SSR: only the data-driven region (shelf) skeletonizes, so D-11 hrefs stay in the server HTML"

key-files:
  created: []
  modified:
    - lib/tokens.js
    - app/listen/page.js
    - app/session/page.js

key-decisions:
  - "Listen's kept toggle reads §7.5 token pairs that REFERENCE §7.2 colors (dark pageBg IS color.inkDeep) instead of duplicating hex"
  - "Session's loading branch skeletonizes only the shelf (plan text), not the whole panel — keeps hero CTAs in SSR HTML and satisfies the plan's curl criterion"
  - "All five Phase-1 Session rail Links kept on ≥768 (plan prose said '4 icon Links' but D-11 lists the rail links as survivors; kept verbatim)"
  - "Session shelf tile text color is luminance-computed per §7.4 (Distribution's amber art flips to ink)"
  - "Hero 'listen instead' CTA on lime styled inline (ink on rgba(18,18,26,.1)) — no .btn-* class, so the class-layer ownership rule is not violated"

patterns-established:
  - "Phone screens outside the dashboard group: skip-link + <main id> + <TabBar/> last + bottom-clearance padding"
  - "Honest disabled pills (.btn-undone, full opacity, title='Coming in a later update') for deferred AUDIO-01/CAPT actions"

requirements-completed: [UI-03, UI-04, UI-05]

# Metrics
duration: 10 min
completed: 2026-08-16
---

# Phase 2 Plan 11: Listen + Session Responsive Summary

**Listen panes stack on phone with a §7.5-tokenized dark toggle and labeled transport controls; Session's rail retires for the global TabBar and greets Iven via lib/store.js — both former 360px worst offenders now sweep clean at 360–1440**

## Performance

- **Duration:** 10 min (continuation: Tasks 0–1 verified from an interrupted run, Task 2 implemented fresh)
- **Started:** 2026-08-16T08:37:01Z
- **Completed:** 2026-08-16T08:47:52Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- `lib/tokens.js` carries `listenLight`/`listenDark` pairs (§7.5) that reference §7.2 token names; the 02-01 import contract and directive-free invariant hold (`tokens.listenDark.pageBg` → `#0e0e14`).
- `/listen` is fully usable at 360px: sidebar hidden on phone (TabBar covers nav), player card with 140px art tile, "Up next" as a chip row, sections list, lime quote card, `minWidth:0` hygiene everywhere; desktop 3-zone proportions kept (D-05).
- Listen transport controls are honest labeled disabled buttons (aria-labels "Play"-family per §11.3, `.btn-undone` idiom, `on-dark` lime focus ring in dark mode); "Save to highlights" likewise.
- `/session` phone shows the global TabBar instead of the 72px rail (destinations re-homed per spec note), full-width lime hero with ink CTAs, stacked waiting rows, 2-col shelf with 64px compact art; desktop chrome verbatim (rail + 4-across shelf).
- The Sam/Iven split is dead: `import { LEARNER_NAME } from '../../lib/store.js'`; both screens greet "Good morning, Iven" (Display 32).
- §14.3 states landed on Session (shelf skeletons + sr-only "Setting up your session…", `role="alert"` error with `res.ok` throw + Retry, Today's empty copy in the lime hero slot).
- Deferred item 3 (the /listen 643px and /session 270px @360 overflows) cleared: `check-viewports.mjs` reports ALL VIEWPORTS CLEAN for both routes at 360/390/768/1024/1440.

## Task Commits

No commits — `commit_docs=false` for this project (git root is the shared `yahshua` parent repo; learnit is untracked there by design). All changes are on disk and verified:

1. **Task 0: listen palette token pairs** — lib/tokens.js (pre-existing from interrupted run, verified)
2. **Task 1: Listen responsive + TabBar + tokenized palette + a11y transport** — app/listen/page.js (pre-existing from interrupted run, verified)
3. **Task 2: Session responsive + LEARNER_NAME + shelf 2-col + states** — app/session/page.js (implemented this run)

## Files Created/Modified
- `lib/tokens.js` — additive `tokens.listenLight`/`tokens.listenDark` (§7.5) referencing §7.2 names; no existing export touched
- `app/listen/page.js` — phone pane stacking (D-05), TabBar last + bottom clearance, token-pair toggle, aria-labeled transport, §9.7 empty guard, D-11 links intact
- `app/session/page.js` — full rewrite: tokenized chrome, useViewport layouts, TabBar on phone, LEARNER_NAME, honest disabled utilities, §14.3 loading/error/empty, D-11 links intact

## Decisions Made
- Kept ALL five Phase-1 rail Links (/, /subjects, /listen, /quiz, /pathway/AI%20Agents) on ≥768 — plan prose said "4 icon Links" but the D-11 fence lists the rail links as survivors; the fifth (quiz) had no reason to die.
- Loading state keeps the static hero/overnight/waiting in DOM and skeletonizes only the shelf — matches the plan's "shelf skeleton tiles … while subjects load" AND keeps the D-11 hero hrefs in server HTML (the plan's own curl criterion demands `pathway/AI%20Agents` ≥ 1 in the raw response).
- Session shelf tile foreground computed from tileColor luminance (§7.4) so Distribution's amber art uses ink text; data-driven for Phase 3 subjects.
- Session "listen instead" hero CTA is an inline-styled Link (no `.btn-*` class) because the class layer owns bg/color on `.btn-*` carriers and there is no lime-secondary variant class.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Loading branch initially dropped the hero CTAs from SSR HTML**
- **Found during:** Task 2 acceptance gate
- **Issue:** First draft replaced the whole content panel while `isLoading`, so `curl /session | grep -c "pathway/AI%20Agents"` returned 0 — the plan's D-11 curl criterion failed (react-query renders the pending state during SSR).
- **Fix:** Skeletonize only the shelf per the plan's loading-state text; header/hero/overnight/waiting render immediately with the sr-only "Setting up your session…" line.
- **Files modified:** app/session/page.js
- **Verification:** curl count = 1; sweep still ALL VIEWPORTS CLEAN; build passes.
- **Committed in:** n/a (commit_docs=false)

**2. [Scope boundary] Literal `grep -rn "Sam" app/` matches "Same" in a comment**
- **Found during:** Task 2 acceptance gate
- **Issue:** The criterion `! grep -rn "Sam" app/` trips on the English word "Same" in `app/(dashboard)/pipeline/page.js` line 96 — a file outside this plan's files_modified fence.
- **Fix:** None (out of scope per the executor fence). The learner-name Sam is verifiably dead: the quoted form `'Sam'` returns nothing in app/, and the greeting renders "Good morning, Iven" from lib/store.js.
- **Verification:** `! grep -q "'Sam'" app/session/page.js` passes; DOM check shows `greeting: "Good morning, Iven"`.
- **Committed in:** n/a

---

**Total deviations:** 2 auto-fixed (1 bug, 1 documented scope-boundary note)
**Impact on plan:** No scope creep; both resolved within the plan's own acceptance criteria.

## Continuation Note

Tasks 0 and 1 (lib/tokens.js pairs, app/listen/page.js rework) were already on disk from an interrupted run. Per the task brief they were verified against every acceptance criterion instead of redone: build passes, TOKENS-LISTEN-OK, LISTEN-OK greps, sweep clean, 360/1440 screenshots inspected, toggle flips pageBg `#f3f2f9` ↔ `#0e0e14` with lime `#c9f24d` focus ring in dark mode, FLOW-04 curl checks pass. Port note: the plan cites 3211; the task brief mandated 3203 — verification ran on 3203 (reusing the interrupted run's server, confirmed serving current code).

## Known Stubs

Intentional, plan-sanctioned deferred wiring (documented for the verifier):
- Listen transport buttons + Session "Search everything" / "+ Save a link" + "Save to highlights": disabled `.btn-undone` pills, `title="Coming in a later update"` — AUDIO-01 / CAPT-01..03.
- Session shelf "+3 new" pills, overnight numerals, "62% through", static date eyebrow: Phase 1 mock semantics until Phase 3 DATA plans.
- Listen loading/error copy exists only as a code comment (§14.3 quotes) — the screen has no fetch, so no dead branches were added, per the plan.

## Issues Encountered
- Port 3203 was already bound by the interrupted run's dev server (EADDRINUSE on a duplicate start). Resolved by verifying the listener's cwd served this project with current code and reusing it; the duplicate process exited harmlessly.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Both routes sweep clean at all five widths; deferred item 3's /listen + /session entries are cleared (02-12 re-runs the full-route sweep as the phase gate).
- /onboarding overflow (deferred item 3's last entry) belongs to 02-10, not this plan.
- Phase 3 can wire the Listen loading/error copy from the code comment and Session's static mock numerals.

## Self-Check: PASSED

- `[ -f lib/tokens.js ]` FOUND — carries listenLight/listenDark (grep + import test LISTEN-TOKENS-OK)
- `[ -f app/listen/page.js ]` FOUND — TabBar/listenDark/aria-label/aria-hidden/btn-undone/encodeURIComponent greps pass (LISTEN-OK)
- `[ -f app/session/page.js ]` FOUND — TabBar/LEARNER_NAME/useViewport/Setting up your session/btn-undone/encodeURIComponent greps pass; no `'Sam'` (SESSION-OK)
- Commits: none expected (commit_docs=false; task brief forbids git commits and STATE.md/ROADMAP.md edits — STATE/ROADMAP/requirements updates are left to the orchestrator)
- `npm run build`: Compiled successfully, 15/15 pages generated
- `node scripts/check-viewports.mjs --port 3203 --routes "/listen?subject=AI%20Agents,/session"`: ALL VIEWPORTS CLEAN (exit 0)
- D-11 inventory (hydrated 1024 DOM): rail /, /subjects, /listen, /quiz, /pathway/AI%20Agents · hero /pathway/AI%20Agents + /listen?subject=AI%20Agents · waiting /subjects + /library · run log /pipeline · shelf /subjects/{AI%20Agents,Distribution,Sales} · Listen "Read instead" → /subjects/Distribution and "Quiz me after" → /quiz?subject=Distribution under ?subject=Distribution

---
*Phase: 02-ui-design-responsive-overhaul*
*Completed: 2026-08-16*
