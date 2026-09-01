---
phase: 02-ui-design-responsive-overhaul
plan: 02
subsystem: ui
tags: [adaptive-routing, server-components, cookies, server-actions, route-groups, landing-page, app-shell, next-navigation]

# Dependency graph
requires:
  - phase: 02-ui-design-responsive-overhaul (plan 01)
    provides: "the two-halves token system (app/globals.css :root vars + class layer, lib/tokens.js factories/GLYPHS) and scripts/check-viewports.mjs — consumed by Landing.js and every verification sweep"
provides:
  - "Adaptive `/`: app/page.js async server component reads learnit_onboarded via await cookies() and RENDS <Landing/> or <AppShell><Today/></AppShell> — zero redirect, IN-06 flash dead"
  - "app/actions.js 'use server' completeOnboarding() — cookie write + redirect('/') invoked by onboarding Finish/Skip (localStorage kept one phase for compat)"
  - "components/Landing.js — the D-02 product-story landing (7 sections, verbatim §13 copy, real /api/subjects tiles as proof, localStorage→cookie migration shim)"
  - "components/AppShell.js — shared dashboard chrome (canvas + 1440px column + TopNav) used by BOTH the (dashboard) layout and the onboarded `/` branch"
  - "components/Today.js — the Phase 1 Today screen moved verbatim ('use client', unchanged content; redesign is 02-09)"
  - "viewport export (viewportFit:'cover', themeColor canvas) in app/layout.js — activates env(safe-area-inset-*) for the 02-08 tab bar"
affects: [02-03, 02-04, 02-05, 02-06, 02-07, 02-08, 02-09, 02-10, 02-11, 02-12]

# Tech tracking
tech-stack:
  added: []  # zero new deps; playwright-core already present via 02-01's --no-save install
  patterns:
    - "Adaptive route: cookie read in an async Server Component (opts the route into dynamic rendering) chooses between two renders — render, never redirect"
    - "Cookie mutation via 'use server' file + redirect(): the action's roundtrip re-renders the tree with the new cookie, so no manual refresh"
    - "Client migration shim: useEffect copies the Phase-1 localStorage flag into document.cookie then router.refresh() — server rendered the correct pre-shim state, so no flash"
    - "Landing responsive ladder: hero via container-driven grid auto-fit minmax(min(100%,460px),1fr) (2-col ≥~1020px, stacked below, ONE h1); tile grids via minmax(280px,1fr) giving 4-across/2×2/1-col; proof strip split only-phone scroll-snap-x carousel vs only-tablet/only-desktop stacks"

key-files:
  created:
    - app/page.js
    - app/actions.js
    - components/Landing.js
    - components/Today.js
    - components/AppShell.js
  modified:
    - app/layout.js
    - "app/(dashboard)/layout.js"
    - app/onboarding/page.js
  deleted:
    - "app/(dashboard)/page.js"
    - components/OnboardingGate.js

key-decisions:
  - "Landing.js authored inside Task 1's atomic change set: app/page.js imports Landing and Task 1's own verify (npm run build) plus its landing-hero acceptance captures are unsatisfiable without it — content still built to Task 2's full spec"
  - "Hero 2-col→stacked via auto-fit grid, not visibility-helper-duplicated heroes: helper duplication would render three <h1>s (violating the one-h1 rule); the container-driven grid is rung 2 (preferred) and needs no media queries"
  - "Proof strip: .only-phone .scroll-snap-x carousel (78vw .snap-item) + the stacked list rendered under both .only-tablet and .only-desktop — the helper set has no '≥768' class, and tiles are shared components so the duplication is container-only"
  - "'See the full run →' used for the pipeline link (plan action string + UI-SPEC §9.1 + the existing Today idiom) over §13's table variant 'See a real run →' — resolving the spec-internal copy conflict in favor of the plan's executable instruction"
  - "'How it works' h2 added to the loop section (discretion per CONTEXT: composition beyond D-02's required content) so the hero's 'See how it works' anchor lands on a labeled section"

patterns-established:
  - "Adaptive-render routing pattern for any server-known preference: read cookie in the page, write cookie in a Server Action, never redirect on read"
  - "AppShell is the single source of dashboard chrome — new dashboard-adjacent renders wrap it instead of re-deriving the canvas/column/TopNav stack"

requirements-completed: [UI-01, UI-04, UI-03, UI-05]

# Metrics
duration: 12 min
completed: 2026-08-15
---

# Phase 2 Plan 2: Adaptive Root + Landing Page Summary

**Cookie-driven adaptive `/` that RENDERS Landing or Today (no redirect, IN-06 flash eliminated via `await cookies()` + a `'use server'` completion Action), plus the D-02 product-story landing with real subject tiles as proof**

## Performance

- **Duration:** 12 min
- **Started:** 2026-08-15T04:16:34Z
- **Completed:** 2026-08-15T04:28:03Z
- **Tasks:** 2 (both auto, no checkpoints)
- **Files modified:** 10 (5 created, 3 modified, 2 deleted)

## Accomplishments
- One atomic move+wire: `app/(dashboard)/page.js` → `components/Today.js` (verbatim, `'use client'`, import path fixed) and the new async server `app/page.js` took over `/` — `npm run build` passed immediately after with exactly one `/` route (ƒ dynamic), no "conflicting paths" error.
- `app/actions.js` `completeOnboarding()` sets `learnit_onboarded=1` (path `/`, maxAge 1y, non-httpOnly for the shim) and `redirect('/')`; onboarding Finish AND Skip both keep `href="/"` as the no-JS fallback and call `finish()` (localStorage write for one-phase compat, then the Action). Playwright round-trip: cookie lands as `1` and `/` renders Today in both paths.
- `components/OnboardingGate.js` deleted and its redirect is gone by design: fresh visitors get the landing AT `/` (FLOW-01's intent preserved by the landing CTA), deep links render ungated (`/library` → 200, zero `Location` headers), `grep router.replace('/onboarding')|OnboardingGate` across app+components returns nothing.
- `components/Landing.js`: all 7 §13 sections with verbatim copy (hero headline/subhead/eyebrow, loop chain + "…and you get told", four doors + "Do the playlist and Telegram now; the rest can wait.", overnight pipeline with the `new → fetched → sorted → done` statusPill ladder and mono `06:00:02 → 06:04:01`, payoff tiles, lime final CTA, footer), real `/api/subjects` tiles (featured AI Agents colored tile with amber progress at readPct; Distribution/Sales list tiles with tileColor dots; skeletons while loading), three "Start setup" CTAs (hero primary, doors ghost, final ink-on-lime primary), `#how-it-works` plain-anchor jump, and the localStorage→cookie migration shim with `router.refresh()`.
- `components/AppShell.js` extracted (canvas `var(--color-canvas)` + 1440px column + TopNav, padding `26px 30px 40px` kept for 02-08); `(dashboard)/layout.js` is now a thin `<AppShell>` wrapper; `app/layout.js` lost the gate and gained the `viewport` export — verified emitted as `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>` + `theme-color #f3f2f9`.

## Task Commits

Not committed — commit skipped (commit_docs=false). All changes left uncommitted in the working tree per the orchestrator's sequential-execution instruction.

## Files Created/Modified
- `app/page.js` — NEW async server component: `await cookies()` → `has('learnit_onboarded')` → `<Landing/>` or `<AppShell><Today/></AppShell>`
- `app/actions.js` — NEW `'use server'` file: `completeOnboarding()` cookie write + `redirect('/')`
- `components/Landing.js` — NEW D-02 landing ('use client', useQuery/useEffect/useRouter, 7 sections, migration shim)
- `components/Today.js` — Today screen moved verbatim from `app/(dashboard)/page.js` (redesign is 02-09)
- `components/AppShell.js` — NEW shared dashboard chrome (server component, no directive)
- `app/layout.js` — OnboardingGate removed; `viewport` export added (`viewportFit:'cover'`, `themeColor:'#f3f2f9'`); Google Fonts `<link>` untouched
- `app/(dashboard)/layout.js` — thin `<AppShell>{children}</AppShell>` wrapper
- `app/onboarding/page.js` — `writeFlag()` → async `finish()` (localStorage + `completeOnboarding()`); both Skip/Finish Links wired; no other markup changed
- DELETED `app/(dashboard)/page.js`, `components/OnboardingGate.js`

## Decisions Made
- **Execution-order interleave (see Deviations):** Landing.js authored within Task 1's change set because Task 1's verify and acceptance are unpassable without it.
- **Hero responsiveness:** `repeat(auto-fit, minmax(min(100%, 460px), 1fr))` grid — one `<h1>`, zero media queries; the 2-col threshold lands ≈1020px (within a few px of the D-04 1024 boundary, container-driven by design).
- **Proof strip containers:** phone carousel via the sanctioned `.scroll-snap-x`/`.snap-item` (~78vw, max 360px); stacked lists under `.only-tablet` AND `.only-desktop` (no "≥768" helper exists); tiles are shared `FeaturedTile`/`ListTile` components so only the wrappers duplicate.
- **Loop cards:** numbered outline-circle captions always visible (order clarity on phone) + `.only-desktop` `→` arrow connectors on non-last cards — "arrow connectors on desktop, numbered captions on phone" with one DOM.
- **Pipeline link copy:** "See the full run →" (plan action + §9.1 + existing Today line) over §13's "See a real run →".
- **Loop heading:** "How it works" h2 added (discretion) so the hero anchor targets a labeled section.

## Deviations from Plan

### Execution-order note (no content deviation)

**1. [Ordering] components/Landing.js authored during Task 1**
- **Found during:** Task 1 (its `<verify>` runs `npm run build`, which resolves app/page.js's Landing import; Task 1's acceptance capture must show "the LANDING hero")
- **Issue:** Task 1's verifications are unsatisfiable until Task 2's file exists
- **Fix:** Authored the full Task-2 Landing inside Task 1's atomic change set, then ran the move's build proof and both tasks' verifies in order
- **Files modified:** components/Landing.js (exactly as Task 2 specifies)
- **Verification:** ADAPTIVE-OK and LANDING-OK chains both pass; all Task 2 acceptance criteria green
- **Committed in:** n/a (commit_docs=false)

---

**Total deviations:** 1 ordering interleave (0 content deviations; all task actions executed exactly as written)
**Impact on plan:** None — required for Task 1's own build proof; the plan's atomicity requirement (no duplicate `/`) was honored and verified.

## Issues Encountered
- The `/tmp` playwright round-trip script initially failed to resolve `playwright-core` (ESM resolution walks up from `/tmp`, not the project). Fixed with `createRequire` pointed at the project's package.json. Verification tooling only; no repo files touched.
- The cookie-injected viewport sweep reports OVERFLOW at 360/390/768 on `/` — these are the PRE-EXISTING Today-page layouts (the 02-01 baseline already flagged `/` at 360/390; Today's content is unchanged by this plan). Fixing them is plan 02-09's job. The sweep's 1024/1440 captures are clean and prove the Today render; the no-cookie sweep (the landing) is ALL VIEWPORTS CLEAN.

## Known Stubs
None introduced by this plan. Landing's proof strip is wired to the real `/api/subjects` query (skeletons while loading, `[]` on error); every landing CTA links to a real route. `components/Today.js` carries Phase 1's decorative spans ("Save a link", "Run now") moved verbatim per the plan — their redesign is plan 02-09.

## Threat Flags

None — no security-relevant surface beyond the plan's threat register. T-02-02-04 verified: `grep -rn dangerouslySetInnerHTML app components` stays empty; all landing copy is static JSX.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Adaptive `/` pattern is live: later plans can render `/`-adjacent states by cookie without touching routing; `AppShell` is the chrome single-source for 02-03..02-09.
- `viewportFit:'cover'` is in place, so plan 02-08's `env(safe-area-inset-bottom)` tab-bar padding will actually populate on notched devices.
- Known baseline for later plans: Today still overflows at 360/390/768 (02-09), onboarding at 360 (02-10), per the 02-01 sweep baseline.
- The localStorage compat flag + migration shim retire in Phase 3 (both files carry retirement comments).

## Verification Log
- `npm run build`: exit 0, single `ƒ /` route, 17 routes total, no conflicting-paths error
- Task 1 chain: `ADAPTIVE-OK` (files absent/present, greps for `await cookies()`, `learnit_onboarded`, `use server`, `viewportFit`, no OnboardingGate in layout, `completeOnboarding` wired, AppShell in dashboard layout)
- Task 2 chain: `LANDING-OK`; `Start setup` ×3; headline verbatim; `scroll-snap-x`; `router.refresh`; `btn-primary` ×2; no `dangerouslySetInnerHTML`
- Fresh headless captures (port 3194): `/tmp/02-02-landing.png` (1280) shows the landing hero, NOT onboarding/Today, no TopNav; `/tmp/02-02-landing-360.png` shows the 1-col hero with inline side-by-side 44px CTAs and carousel-cut tiles; `/tmp/02-02-landing-1440.png` shows the 2-col hero with the three real subject tiles beside the copy
- Cookie sweep (`--routes /`): `/` captures show "Built while you slept, Iven" under the white TopNav (Today dashboard); no-cookie sweep: `ALL VIEWPORTS CLEAN` (exit 0)
- curl: `/library` 200 with 0 `Location` headers; `/subjects`, `/pipeline`, `/listen`, `/session`, subject/pathway/quiz deep links all 200 with cookie; `/nope` 404 (FLOW fence)
- Playwright round-trip: 6/6 PASS — cookie context → Today; wizard Finish → cookie=1 + Today; Skip → cookie=1 + Today; localStorage-only shim → Today after refresh
- Dev server killed; port 3194 clear

## Self-Check: PASSED

- Files exist: app/page.js, app/actions.js, components/Landing.js, components/Today.js, components/AppShell.js (FOUND via `[ -f ]`); app/(dashboard)/page.js and components/OnboardingGate.js absent (FOUND via `test ! -f`)
- `npm run build` exits 0 (run after the move and again in both verify chains)
- All Task 1 + Task 2 acceptance criteria executed and logged above (PASS)
- Commits: none expected (commit_docs=false — commit skipped)

---
*Phase: 02-ui-design-responsive-overhaul*
*Completed: 2026-08-15*
