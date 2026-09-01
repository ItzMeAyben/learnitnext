---
phase: 01-connect-screens
plan: 1
subsystem: ui
tags: [nextjs, react, app-router, onboarding, localstorage, use-router]

# Dependency graph
requires: []
provides:
  - First-visit gate (OnboardingGate in root layout) redirecting flag-less visitors to /onboarding
  - learnit_onboarded localStorage flag contract (set by Finish setup / Skip setup, read by the gate)
  - Fully navigable 5-step onboarding wizard (Back/Continue/Skip/Finish)
affects: [01-connect-screens remaining plans, phase verifier FLOW-01/FLOW-02]

# Tech tracking
tech-stack:
  added: []  # zero new dependencies — next/link + next/navigation only
  patterns:
    - "Client first-run gate: localStorage read inside useEffect + router.replace (no middleware/proxy, hydration-safe)"
    - "Wizard step state: useState(1..5) with derived left-rail done/active flags and STEP_META copy table"

key-files:
  created:
    - components/OnboardingGate.js
  modified:
    - app/layout.js
    - app/onboarding/page.js

key-decisions:
  - "Gate uses router.replace (not push) so browser Back from Today never re-enters the wizard"
  - "Logo Link to / replaced with a plain div — leaving onboarding mid-wizard without the flag would bounce straight back (redirect loop flash); exits go through Finish setup / Skip setup only"
  - "Steps 1/2/4/5 panels are lightweight single InfoCards in the existing card idiom (D-02 discretion), step 3 markup preserved byte-for-byte (D-11)"

patterns-established:
  - "Pattern: client-side first-visit gate mounted in root layout, localStorage touched only inside useEffect (hydration safety, research Pitfall 5)"
  - "Pattern: exit-from-flow Links carry replace + flag-setting onClick (Skip setup / Finish setup idiom)"

requirements-completed: [FLOW-01, FLOW-02]

# Metrics
duration: 4 min
completed: 2026-08-14
---

# Phase 1 Plan 1: Make LearnIt's front door real Summary

**First-visit localStorage gate in the root layout redirecting fresh visitors to /onboarding, plus a fully navigable 5-step onboarding wizard with working Back/Continue/Skip/Finish controls landing on Today**

## Performance

- **Duration:** 4 min (261 s)
- **Started:** 2026-08-14T16:33:07Z
- **Completed:** 2026-08-14T16:37:28Z
- **Tasks:** 2
- **Files modified:** 3 (1 created, 2 modified)

## Accomplishments
- First-visit routing (D-01 / FLOW-01): `components/OnboardingGate.js` mounted as the first child inside `<Providers>` in `app/layout.js` — covers `/`, dashboard pages, `/listen`, `/session`, and deep links; exempts `/onboarding` itself; `router.replace('/onboarding')` when `learnit_onboarded` is absent; localStorage touched only inside `useEffect`.
- Navigable wizard (D-02 / FLOW-02): `app/onboarding/page.js` now starts at step 1 with `useState(1)`; left-rail done/active flags derive from `step`; `STEP_META` drives the eyebrow (`STEP {step} OF 5`), heading, and body copy per step; Back uses `Math.max(1, s - 1)` (0.5 opacity at step 1), Continue uses `Math.min(5, s + 1)`.
- Finish + skip (D-01): final Continue becomes a "Finish setup" `<Link href="/" replace>` and a "Skip setup →" link sits in the footer status row — both set `localStorage.setItem('learnit_onboarded', '1')` and land on `/` (Today) with no re-gating.
- No dead controls left on the wizard: the two step-3 "Set up later" pills now advance the step; the existing Telegram `Verify` toggle kept; step-3 door cards, warning strip, "Cost so far" sidebar, and page chrome preserved unchanged (D-11).

## Task Commits

Per-task commits are disabled for this project (`commit_docs: false`; the git root is the shared `yahshua` monorepo with learnit untracked). All changes are left uncommitted in the working tree as instructed.

1. **Task 1: Create the first-visit gate component and mount it in the root layout** — commit skipped (commit_docs=false)
2. **Task 2: Make the onboarding wizard navigable end-to-end with finish and skip** — commit skipped (commit_docs=false)

**Plan metadata:** commit skipped (commit_docs=false)

## Files Created/Modified
- `components/OnboardingGate.js` (new, 20 lines) — `'use client'` gate: usePathname/useRouter + useEffect; reads `learnit_onboarded`; `router.replace('/onboarding')` when absent; returns null.
- `app/layout.js` — imports OnboardingGate; renders `<Providers><OnboardingGate />{children}</Providers>` so the gate covers every route.
- `app/onboarding/page.js` (305 lines) — wizard rework: `useState(1)` step state, derived STEPS flags, `STEP_META` copy table (1 table → 2 agent → 3 ways to save → 4 bridge → 5 schedule, per the SPEC setup order), lightweight InfoCard panels for steps 1/2/4/5, step-3 markup preserved, live Back/Continue/Skip/Finish + "Set up later" pills, logo Link replaced with a plain div.

## Decisions Made
- `router.replace` (not push) in the gate, per plan: browser Back from Today must not re-enter the wizard.
- Logo `<Link href="/">` converted to a plain `<div>` with identical markup/styles, per plan item 7: a mid-wizard escape to `/` without the flag would be bounced straight back by the gate (redirect-loop flash).
- Non-step-3 panels rendered inside a single-column grid using a small `InfoCard` helper in the existing card idiom (`border: '1.5px solid #e3e1ee', borderRadius: 18, padding: 18`).
- Step-3 footer status text keeps the telegramConnected ternary; other steps show `Step {step} of 5`; skip link shares the same flex row.

## Deviations from Plan

None - plan executed exactly as written.

(One formatting-only adjustment during Task 2: the Skip/Finish Links were written with single-line `href="/" replace onClick={...}` props instead of multiline props so the plan's literal acceptance grep `grep 'href="/" replace'` matches — behavior identical, no plan change.)

## Verification Results

Task 1 automated (`npm run build` + greps): PASS — build exit 0; `learnit_onboarded`, `router.replace('/onboarding')`, `OnboardingGate` in layout present; no `middleware` string, no `router.push`; `useEffect` count 2; gate tag before `{children}`; localStorage only inside the effect body.

Task 1 acceptance criteria: all PASS (logged above).

Task 2 automated (`npm run build` + greps): PASS — build exit 0; `useState(1)`, `Finish setup`, `Skip setup`, `learnit_onboarded` present; no hardcoded `STEP 3 OF 5`.

Task 2 acceptance criteria: all PASS — `STEP_META` count 4 (>= 3); `STEP {step} OF 5` present; `Math.max(1, s - 1)` and `Math.min(5, s + 1)` present; flag set exactly 2 (finish + skip); `Set up later` count 2, each on a span with `onClick` (lines 184, 203); `href="/" replace` matches (2 Links, the only Links to `/` in the file); file 305 lines (>= 150).

Plan-level verification:
- `npm run build` exits 0 — PASS (proves no removed Next APIs used; Turbopack production build, 17 routes).
- Runtime checks (fresh profile redirect from `/`, `/library`, `/listen`; 4x Continue to step 5; Finish/Skip land on `/` and stay): NOT RUN — the dev server was not started for this execution run per orchestrator instructions. The plan itself routes these through the phase verifier ("Phase-level FLOW-01/FLOW-02 checks happen in the phase verifier").
- must_haves artifacts: all three present with required contents and minimum line counts (gate 20 >= 12; page 305 >= 150; layout mounts gate).

### Re-verification (fresh executor run, 2026-08-14T17:13Z)

A fresh executor run re-verified the complete plan against the working tree (implementation
from the initial run was found in place; nothing needed rework). Every check re-run, all PASS:

- Task 1 automated command (`npm run build` + gate/layout greps): PASS — build exit 0 (Next 16.3.1 Turbopack, 17 routes).
- Task 1 acceptance criteria: `useEffect` count 2 (>= 1); `pathname === '/onboarding'` present; `router.replace` present with zero `router.push`; `<OnboardingGate />` before `{children}` on layout line 21; single `localStorage` call at gate line 14 inside the `useEffect` body (lines 12-17); no `middleware` string; gate 20 lines (>= 12).
- Task 2 automated command (`npm run build` + page greps): PASS — build exit 0.
- Task 2 acceptance criteria: `STEP_META` count 4 (>= 3); `STEP {step} OF 5` dynamic eyebrow (line 119); `Math.max(1, s - 1)` (line 281) and `Math.min(5, s + 1)` (lines 184, 203, 288); `localStorage.setItem('learnit_onboarded', '1')` exactly 2 (finish + skip); `Set up later` count 2, each inside a span with `onClick` (184→187, 203→206); `href="/" replace` on both Links (275, 294); no `STEP 3 OF 5`; only 2 `<Link` elements in the file — both the flag-setting replace Links, logo is a plain div (no plain link to `/` remains); `useState(1)` (line 57); page 305 lines (>= 150).
- must_haves artifacts and key_links patterns: all present as specified.
- Next 16 docs re-read this run per D-12 (`use-router.md`: `router.replace` from `next/navigation` correct; `link.md`: `replace` prop + onClick pass-through, no `legacyBehavior`).
- Runtime browser checks remain routed to the phase verifier (dev server intentionally not started this run).

## Known Stubs

None introduced. Pre-existing mock content intentionally preserved per D-11 (out of scope this phase):
- Step-3 door cards show hardcoded mock data (playlist ID `PLkH8kR2FhTf9c1a2Bd7Q`, "paste your BotFather token" placeholder, `telegramConnected` local-state Verify toggle). Real integrations are spec Setup work (INTG phases); capture actions are Phase 3.

## Issues Encountered
None.

## Authentication Gates
None — no external services involved.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- FLOW-01/FLOW-02 code-complete and build-verified; ready for the phase verifier's runtime pass (fresh-profile redirect, wizard traversal, finish/skip landing).
- `learnit_onboarded` flag contract established for any later flow work.
- No blockers. Note for downstream plans: the logo-div change in onboarding is intentional — do not reintroduce an unflagged Link to `/` from onboarding.

## Self-Check: PASSED

- Files exist: `components/OnboardingGate.js` (created), `app/layout.js` (modified), `app/onboarding/page.js` (modified), `01-01-SUMMARY.md` — all FOUND.
- Artifact contains-checks: `learnit_onboarded` in gate, `Finish setup` in onboarding page, `OnboardingGate` in root layout — all PASS.
- `npm run build` exits 0 (verified 3x this run: once standalone, once per task's automated command).
- Commit existence check: N/A — commits disabled for this project (`commit_docs: false`); all changes left uncommitted in the working tree as instructed, and the SUMMARY documents each commit as "commit skipped (commit_docs=false)".

---
*Phase: 01-connect-screens*
*Completed: 2026-08-14*
