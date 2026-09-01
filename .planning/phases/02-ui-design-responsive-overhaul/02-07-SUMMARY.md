---
phase: 02-ui-design-responsive-overhaul
plan: 07
subsystem: ui
tags: [responsive, design-tokens, react-query, pipeline, skeleton-states, use-viewport]

# Dependency graph
requires:
  - phase: 02-ui-design-responsive-overhaul (02-01)
    provides: the two-halves token system (globals.css :root + class layer, lib/tokens.js pill/card/statusPill/useViewport/GLYPHS, .btn-undone/.skeleton/.on-dark classes)
  - phase: 02-ui-design-responsive-overhaul (02-02)
    provides: AppShell dashboard chrome, scripts/check-viewports.mjs sweep tool
provides:
  - Responsive Pipeline screen — step cards reflow 2-across phone / 3-across tablet / 6-across desktop, status ladder → row → 2×2 → vertical ↓ stack, run log beside (400px) → below (full-width), banners full-width
  - §14.3 pipeline tone states — 6 skeleton step-cards + sr-only "Replaying last night's run…", role=alert "Couldn't load the pipeline." + Retry, "No runs yet" empty state with the Run-all pill present
  - The §9.1 honest-disabled idiom on all six not-yet-wired pipeline controls (Schedule ▾, Retry all danger, Rename, Keep, Copy log, Open skill) while keeping the app's ONE live mutation (Run all now → POST /api/pipeline/run) byte-for-byte intact
affects: [02-ui-design-responsive-overhaul (02-08 phone chrome + 02-12 final sweep re-check /pipeline; Phase 5 PIPE-01/02 wires ladder semantics and Retry-all)]

# Tech tracking
tech-stack:
  added: [] # zero new dependencies (D-06)
  patterns:
    - "Structural axis swap via useViewport(): ladder renders desktop flex-row (→) / tablet 2×2 grid (↓ under rungs 1–2) / phone vertical column (↓) from one RUNGS array — 02-RESEARCH Pattern 3 rung 4"
    - "Phone-only explicit 2-col step grid + auto-fit minmax(200px,1fr) ≥768 (same idiom as 02-06's library stats grid): plan-literal rule yields 3-across @768 and 6-across @1440, the two canonical spec widths"
    - "Honest disabled pills: <button disabled> + .btn-undone (undimmed) + title=\"Coming in a later update\", no handlers — D-11 no-dead-spans"
    - "on-dark applied directly on the run-log ghost buttons — globals.css dual selector (.on-dark:focus-visible, .on-dark :focus-visible) covers the element-carried case"

key-files:
  created: []
  modified:
    - app/(dashboard)/pipeline/page.js

key-decisions:
  - "Phone step grid is an explicit repeat(2, 1fr) branch (not auto-fit) — the plan's literal minmax(200px,1fr) cannot produce 2-across inside a 252px card at 360px; the explicit branch satisfies the plan's own §12 row 11 + 360px acceptance and matches the 02-06 sibling idiom"
  - "Exactly-1024 shows 4-across steps (auto-fit interpolation); the spec's 6-across materializes at 1440 and 3-across at 768 — kept the plan's prescribed rule verbatim rather than forcing 6 cramped columns at 1024"
  - "Retry-all keeps the plan's exact prescribed markup (btn btn-danger btn-undone) even though the danger-tint pill sits on the danger-tint banner (blends by design); revisit when Phase 5 wires it"
  - "Empty-state CTA is the live Run-all primary button (§14.3 'pill stays present'), rendered beside the §9.7 guidance copy"

patterns-established:
  - "Viewport-aware ladder/log: desktop side-by-side with maxWidth 400 (D-05 proportions), non-desktop full-width below via flexDirection swap on useViewport() !== 'desktop'"

requirements-completed: [UI-03, UI-04, UI-05]

# Metrics
duration: 12min
completed: 2026-08-15
---

# Phase 2 Plan 07: Responsive Pipeline Screen Summary

**Pipeline screen reflows steps/ladder/log across phone-tablet-desktop on the 02-01 tokens with §14.3 tone states and six honest disabled action pills — while the app's one live mutation (Run all now → POST /api/pipeline/run + onSuccess setQueryData) survives the rewrite untouched and re-verified live.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-08-15T15:36:42Z
- **Completed:** 2026-08-15T15:48:19Z
- **Tasks:** 2
- **Files modified:** 1 (`app/(dashboard)/pipeline/page.js`)

## Task Commits

No git commits — `commit_docs=false` per the orchestrator instruction ("No git commits"), and the learnit working tree sits untracked inside the parent `/Volumes/1TBFULLYPAID/Projects/yahshua` repository, so per-task commits were not performed. All work is on disk and verified below.

## Accomplishments

- **Responsive story (D-04/D-05):** steps 2-across ×3 @360 → 3-across ×2 @768 → 6-across @1440; status ladder → desktop row / tablet 2×2 with ↓ under the first two rungs / phone vertical ↓ stack; ink run log 400px beside the ladder @desktop and full-width mono below on tablet/phone; banners wrap full-width. Zero page-content overflow at 360/390/768/1024/1440 (see Deviations #1 for the shared-chrome residual).
- **Tone states (§14.3, verbatim):** loading = aria-busy + 6 skeleton step-cards (~110px, same grid) + sr-only "Replaying last night's run…" (bare "Loading pipeline…" gone); error = role=alert "Couldn't load the pipeline." + live Retry via `refetch`; empty = "No runs yet" + "The first 6am run writes itself here. You can also trigger one." with the Run-all primary pill present.
- **D-11 fence held:** the `useMutation` (POST /api/pipeline/run) and `onSuccess` `setQueryData(['pipeline'], result)` are byte-identical; live click test confirmed one POST, sub-line 6:04am → wall-clock time, all 6 steps "· re-run", manual-run log line appended, pill "6 of 6 clean".
- **Honest actions (§9.1):** Schedule ▾ / Rename / Keep = disabled `btn-secondary btn-undone`; Retry all = disabled `btn-danger btn-undone`; Copy log / Open skill = disabled `btn-ghost btn-undone on-dark` (lime focus-ring swap). Six total, all `title="Coming in a later update"`, no handlers, no dead spans.
- **Tokenization (§6/§7/§9.2):** Display-32 h1 and ladder numerals (lh 1), Heading-20 card headers, mono Caption 12 log/times, statusPill('done') clean-run badge, §7.3 ladder tile colors (accent new / surface-tint fetched / sorted accentText / done success-tint), danger banner danger-text-on-danger-tint, log card via `card({dark:true})` with on-dark-faint timestamps and lime/danger-bright highlights.

## Files Created/Modified

- `app/(dashboard)/pipeline/page.js` — full presentation rewrite (header/actions, step grid, §14.3 states, viewport-aware ladder/banners/log) over the preserved data layer (useQuery ['pipeline'], the Run-all mutation, RunLogLine split logic, okCount derivation).

## Decisions Made

- Phone step grid uses an explicit `repeat(2, 1fr)` branch: the plan's literal `auto-fit minmax(200px, 1fr)` mathematically yields 1-across inside the 252px-wide card interior at 360px, contradicting the plan's own acceptance criterion ("360 shows 2-across") and §12 row 11 ("2-across ×3 phone"). The explicit branch + auto-fit ≥768 satisfies both and reuses the 02-06 library-stats idiom.
- The auto-fit rule was kept verbatim for ≥768 even though exactly-1024 interpolates to 4-across: the spec's canonical widths all land as specified (768 → 3-across, 1440 → 6-across), measured live.
- SSR/hydration: `useViewport()` server-renders the phone layout (both media queries false) and corrects to tablet/desktop after mount — the accepted Pattern-3-rung-4 seam, same as 02-06.
- Raw apostrophes in JSX copy (`Couldn't`, `last night's`) so the plan's verbatim §14.3 greps pass from source (02-06 precedent).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Viewport sweep overflow is the shared TopNav chrome, not the Pipeline page**
- **Found during:** Task 2 acceptance (viewport sweep)
- **Issue:** `node scripts/check-viewports.mjs --port 3199 --routes /pipeline` reports OVERFLOW 415px @360, 385px @390, 7px @768 (clean @1024/1440). DOM measurement isolated every offender to `components/TopNav.js` (tab cluster 464px + ⌕◔▾ cluster → 775px min width) — the pre-existing issue in `deferred-items.md` §1 (found during 02-04, identical on every `(dashboard)` route; owner plan 02-08, which ships the phone chrome and collapses TopNav ≥768).
- **Fix:** Not fixable inside this plan — `files_modified` lists only `app/(dashboard)/pipeline/page.js` (hard constraint; TopNav/AppShell are 02-08 files). Followed the 02-04/02-06 protocol: re-swept with the deferred TopNav hidden via DOM — **Pipeline content is CLEAN (0px overflow) at 360/390/768/1024/1440**; the sweep residuals match the documented baseline exactly (414/384/6px in 02-04 vs 415/385/7px here).
- **Files modified:** none (out of scope — already tracked in deferred-items.md §1)
- **Verification:** content-clean at all five widths (PASS lines per width); offender isolation listed only TopNav elements; page column measured 300px at 360.

**2. [Rule 1 - Bug] Apostrophe entities would have failed the plan's verbatim-copy greps**
- **Found during:** Task 1 implementation
- **Issue:** JSX source written with `&rsquo;` would make `grep -q "Replaying last night's run"` / `grep -q "Couldn't load the pipeline."` fail (§14.3 copy must be grep-able verbatim).
- **Fix:** Raw apostrophes in the JSX text.
- **Verification:** Task 1 grep suite prints `PIPELINE-STATES-OK`.

---

**Total deviations:** 2 auto-fixed (1 blocking/shared-chrome, 1 grep-correctness)
**Impact on plan:** None on scope or behavior — the Pipeline page itself meets every criterion; the overflow residual is the shared-chrome baseline awaiting 02-08.

## Verification Evidence

- `npm run build` — passes (all routes; /pipeline static). Final build re-run after the dev server was killed: ✓ Compiled successfully.
- Task 1 automated: `PIPELINE-STATES-OK` ("Replaying last night's run" / "Couldn't load the pipeline." / "No runs yet" / btn-undone / mutation.mutate / pipeline/run present; "Loading pipeline" absent); `grep -c btn-undone` = 6 (≥1 required).
- Task 1 live (playwright-core, system Chrome, port 3199): Run-all click → exactly one `POST /api/pipeline/run`; sub-line "last run finished 6:04am" → wall-clock time (setQueryData path); 6 steps show "· re-run"; run log gains "manual run triggered from dashboard"; pill "6 of 6 clean".
- Task 2 automated: `PIPELINE-LADDER-OK` (useViewport / JetBrains-mono / btn-danger / on-dark) + `RETRYALL-DISABLED-OK` ("Retry all" button carries `disabled`).
- Geometry (live measurement): @360 rung tiles all 252px (full card width) stacked vertically with 3 ↓ arrows, log card 300px full-width BELOW the ladder, step cards 2-across ×3 rows; @1024 rungs in one flex-weighted row with 3 → arrows, log card exactly 400px beside; @768 steps 3-across ×2; @1440 steps 6-across ×1.
- Buttons @390: 7 buttons total — 6 disabled honest pills (Schedule ▾, Retry all, Rename, Keep, Copy log, Open skill) + exactly 1 live ("Run all now"); 6 × .btn-undone, 6 × title tooltip.
- Forced states (route interception): loading = aria-busy + 6 .skeleton + sr-only copy, no bare text; error = role=alert + verbatim copy + live Retry (after react-query retries); empty = "No runs yet" + guidance + live Run-all pill.
- Screenshots: `/tmp/shots/360-pipeline.png` (2-across steps, vertical ↓ ladder, full-width mono log), `/tmp/shots/1024-pipeline.png` (→ ladder + 400px side log), plus `loading-pipeline.png`, `empty-pipeline.png`.
- Dev server on port 3199 killed after verification; port confirmed free.

## Known Stubs

None new. Step counts, ladder rung numbers, banner copy and run-log entries remain the Phase 1 mock store data — intentional per the plan ("Step/log data stays mock — Phase 5 owns semantics"; deferred PIPE-01/02). Every disabled action pill is honestly labeled, not a fake-function stub.

## Issues Encountered

- Running `npm run build` while the dev server held `.next` produced a stale-looking sweep on first run; killing and restarting the dev server reproduced identical numbers, proving the overflow was genuinely the shared TopNav (Deviation #1), not stale output.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `/pipeline` content meets UI-03 at all five widths pending the 02-08 phone chrome (TopNav collapse + TabBar), which clears the last shared-chrome overflow; 02-12's phase-final sweep re-checks this route.
- Phase 5 (PIPE-01/02) can wire Retry-all, ladder counts and step semantics onto the now-semantic structure; the Retry-all danger pill may want a surface border or variant reconsideration once functional (it currently sits on a same-color danger-tint banner per the plan's prescribed markup).

## Self-Check: PASSED

- Modified file exists: `app/(dashboard)/pipeline/page.js` ✓ (build compiles it)
- Grep gates: `PIPELINE-STATES-OK`, `PIPELINE-LADDER-OK`, `RETRYALL-DISABLED-OK` ✓
- Acceptance criteria: all Task 1 + Task 2 criteria executed and PASS (see Verification Evidence); the sweep exit-1 residual is the documented shared-chrome baseline (Deviation #1), identical to 02-04/02-06.

---
*Phase: 02-ui-design-responsive-overhaul*
*Completed: 2026-08-15*
