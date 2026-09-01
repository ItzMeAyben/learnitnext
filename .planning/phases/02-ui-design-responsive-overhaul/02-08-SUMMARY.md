---
phase: 02-ui-design-responsive-overhaul
plan: "08"
subsystem: ui
tags: [responsive, navigation, tab-bar, a11y, nextjs, inline-styles, design-tokens]

# Dependency graph
requires:
  - phase: 02-ui-design-responsive-overhaul (02-01)
    provides: "token :root vars + .tabbar/.topnav/.tab-item/.tabbar-item/.skip-link/.btn-undone class layer in globals.css; useViewport in lib/tokens.js"
  - phase: 02-ui-design-responsive-overhaul (02-02)
    provides: "AppShell shared chrome rendered by app/(dashboard)/layout.js and the onboarded branch of app/page.js"
provides:
  - "components/TabBar.js — self-hiding fixed phone bottom tab bar (5 SVG-icon destinations, aria-current, safe-area aware)"
  - "components/PhoneHeader.js — 56px phone inline header (logo mark + pathname-derived screen title)"
  - "Responsive AppShell: skip-link first tab stop, TopNav/PhoneHeader swap, <main id=main-content>, TabBar DOM-last, viewport-based padding with phone bottom clearance"
  - "Tokenized desktop TopNav (.topnav/.tab-item, aria-current, nav landmark, disabled Search button per §9.1)"
affects: [02-09 (Today renders inside AppShell), 02-11 (renders TabBar in Listen/Session directly), 02-12 (final sweep re-checks chrome), Phase 4 (wires the Search button)]

# Tech tracking
tech-stack:
  added: []   # zero new dependencies (D-06)
  patterns:
    - "Class-owned visibility: .topnav/.tabbar own display per breakpoint; inline styles never set display on those carriers (ownership rule, 02-RESEARCH Pattern 2)"
    - "DOM-last fixed nav: TabBar renders after <main> so tab order reads content → nav (§11.2, Pattern 4)"
    - "Pathname→title hardcoded map for PhoneHeader (never the URL value — T-02-08-01)"

key-files:
  created:
    - components/TabBar.js
    - components/PhoneHeader.js
  modified:
    - components/TopNav.js
    - components/AppShell.js
    - .planning/phases/02-ui-design-responsive-overhaul/deferred-items.md (item 1 cleared, item 3 logged)

key-decisions:
  - "TabBar always renders; CSS display:none ≥768px removes it from the a11y tree (simpler than JS, sanctioned by §11.3)"
  - "PhoneHeader swap is JS (useViewport === 'phone'); TopNav swap is pure CSS class — structural vs visibility distinction per 02-RESEARCH Pattern 3"
  - "Tablet compresses the TopNav logo to mark-only via .only-desktop wordmark (768px could not fit the 751px Phase-1 logo row); desktop ≥1024 keeps the full idiom verbatim (D-05)"
  - "Search affordance became a real disabled .btn-undone button with tooltip (§9.1 not-yet-wired idiom) instead of a dead span"

patterns-established:
  - "Nav state ownership: aria-current/hover colors come exclusively from .tab-item/.tabbar-item classes; carriers carry only layout inline styles"
  - "Second landmark nav: both bars are <nav aria-label=\"Primary\">, the inactive one display:none'd — exactly one exposed per width"

requirements-completed: [UI-03, UI-05]

# Metrics
duration: 11 min
completed: 2026-08-15T16:05:37Z
---

# Phase 2 Plan 08: Responsive Nav Shell (TopNav / TabBar / PhoneHeader / AppShell) Summary

**Phone bottom tab bar + slim inline header shipped, TopNav tokenized to ≥768px with class-owned visibility, and AppShell became the responsive chrome (skip-link → nav → main → DOM-last TabBar) — clearing the shared-chrome overflow that deferred-items item 1 tracked**

## Performance

- **Duration:** 11 min (2026-08-15T15:54:26Z → 2026-08-15T16:05:37Z)
- **Tasks:** 2/2 complete
- **Files modified:** 4 code files + deferred-items.md

## Accomplishments
- `components/TabBar.js`: five `<Link>` destinations mirroring TopNav's TABS verbatim (D-11), hand-written 24px inline SVGs (house / 4-grid / headphones / stacked books / arrow-flow), `aria-current="page"` via usePathname, `.tabbar-item`/`.tabbar-indicator` state from the class layer; self-hides ≥768 via `.tabbar`.
- `components/PhoneHeader.js`: 56px inline header with the ink logo tile + title from a hardcoded pathname map (Today/Subjects/Listen/Library/Pipeline/Quiz/Pathway/Session, '' fallback); renders only when `useViewport() === 'phone'`.
- `components/TopNav.js`: outer `<header className="topnav">` (no inline display — class owns visibility), inner div carries the flex row; tabs are `.tab-item` Links with aria-current and no inline background/color/fontWeight; fully tokenized (surface/ink/surface-sunken/text-secondary/radius-xl/pill/circle/notify/border-strong); tab cluster is now a `<nav aria-label="Primary">` landmark; Search is a real disabled `.btn .btn-undone` button with `title="Coming in a later update"`; notification/avatar chrome `aria-hidden`.
- `components/AppShell.js`: now `'use client'`; DOM order skip-link → TopNav → PhoneHeader → `<main id="main-content">` (minWidth 0, gap md2) → TabBar last; padding phone `md / calc(72px + env(safe-area-inset-bottom))`, tablet `md2 md`, desktop Phase-1 `26px 30px 40px` verbatim.
- Deferred item 1 CLEARED: after the fix, every `(dashboard)`-group route sweeps clean at 360/390/768/1024/1440 (`/subjects`, `/subjects/AI%20Agents`, `/library`, `/pipeline`, `/pathway/AI%20Agents`, `/quiz?subject=AI%20Agents`) and `/` is clean at 1024/1440.

## Task Commits

No commits — `commit_docs: false` (learnit is untracked in the parent monorepo) and this run was instructed to make no git commits. Changes live in the working tree: `components/TopNav.js`, `components/TabBar.js` (new), `components/PhoneHeader.js` (new), `components/AppShell.js`, plus `.planning/phases/02-ui-design-responsive-overhaul/deferred-items.md`.

## Files Created/Modified
- `components/TabBar.js` (new) — fixed phone bottom bar; five destinations + icons; class-owned state; always rendered, CSS-hidden ≥768.
- `components/PhoneHeader.js` (new) — phone-only 56px header; pathname→title map; tokenized.
- `components/TopNav.js` — tokenized, class-visible ≥768, `.tab-item` tabs with aria-current, nav landmark, §9.1 disabled Search, `.only-desktop` wordmark for the tablet fit.
- `components/AppShell.js` — responsive client shell: skip-link, header swap, main landmark, DOM-last TabBar, viewport padding + phone bottom clearance.
- `deferred-items.md` — item 1 marked CLEARED with evidence; new item 3 logs content-owned overflows to their owning plans.

## Decisions Made
- Wordmark hidden at tablet only (`.only-desktop`): the Phase-1 logo row (≈751px min) exceeds the 704px available at 768px; mark-only logo at 768–1023, full idiom ≥1024 untouched (D-05 preserved; the probe measured TopNav's row right edge at 775px pre-fix, exactly the old "6px @768" deferred symptom).
- `fontSize: 14` kept inline on `.tab-item` Links (no class rule touches font-size; preserves Phase-1 desktop rendering) while fontWeight/color/background stay class-owned.
- AppShell keeps a `md2` (20px) column gap — preserves the Phase-1 desktop rhythm between nav and content exactly.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TopNav still overflowed by 7px at exactly 768px after adopting `.topnav`**
- **Found during:** Task 2 acceptance sweep
- **Issue:** The class fix hides TopNav <768, but at 768–1023 the Phase-1 logo row (tile + wordmark + pill track + utilities ≈ 751px) does not fit the 704px of available content width — the residual "6px @768 on every dashboard route" from deferred item 1.
- **Fix:** Added the sanctioned `.only-desktop` visibility helper to the wordmark span (mark-only logo at tablet); no JS, no class-layer edits, desktop ≥1024 renders the full logo idiom verbatim.
- **Files modified:** components/TopNav.js
- **Verification:** DOM probe: `/subjects` and `/library` @768 scrollWidth = 768 exactly (was 775); full sweep re-run — all dashboard-group routes clean at all five widths.
- **Committed in:** n/a (no commits this run)

**2. [Documentation] `grep -c "Link" components/TabBar.js` reads 3, not ≥5**
- **Found during:** Task 1 acceptance gate
- **Issue:** The criterion's literal grep counts LINES containing "Link"; the plan's own action prescribes a single mapped `<Link>` (from the mirrored TABS array), which renders all five links from 3 lines.
- **Fix:** None needed to the code (map is the prescribed form and mirrors TopNav). Criterion intent verified instead: the five `to` values are exactly `/`, `/subjects`, `/listen`, `/library`, `/pipeline` (byte-identical to TopNav's TABS) and all five render as links (confirmed in the tab-order walk and aria-current probe).
- **Files modified:** none
- **Verification:** `grep -o "to: '[^']*'"` output + probe-active.mjs runtime check.

---

**Total deviations:** 2 (1 auto-fixed bug, 1 documented criterion-intent reading)
**Impact on plan:** The tablet fix was required to satisfy this plan's own acceptance (deferred item 1 remnant). No scope creep; no files outside the fence touched.

## Issues Encountered
- The plan's `/` acceptance ("clean at 360–1440") is not fully achievable at 02-08 execution time: `/`'s remaining 552/522/144px overflow at 360/390/768 comes entirely from `components/Today.js` page content (header action row, 4-across fresh strip, 320px right rail) — 02-09's file, outside this plan's files_modified fence. Verified by DOM offender probe that the shell (TopNav/PhoneHeader/TabBar/column) contributes zero offenders. Logged as deferred-items item 3 with owners (02-09 Today, 02-11 Listen/Session, 02-10 onboarding). The plan's qualifier "the shell adds no overflow at any width" is fully met.
- Listen/Session/Onboarding overflows observed in the sweep are likewise page-owned (02-11 / 02-10), expected — those screens do not use AppShell yet.

## Verification Results
- `npm run build`: passes (run 3× — after Task 1, after Task 2, final).
- Task 1 greps: `PHONE-CHROME-OK` (aria-label="Primary", aria-current, tabbar-item, `<svg`, href count, usePathname).
- Task 2 greps: `SHELL-OK` (topnav, tab-item, aria-current, skip-link, main-content, TabBar, PhoneHeader, safe-area-inset-bottom).
- Viewport sweep (port 3200, cookie fixture): all dashboard-group routes + `/` @1024/1440 clean; remaining failures only in page content owned by 02-09/02-10/02-11 (see above). Un-onboarded `/` (landing) clean at all five widths.
- Screenshot acceptance (image-inspected): 360-/subjects shows PhoneHeader ("L" + "Subjects"), content, bottom bar with Subjects active + purple indicator bar, NO TopNav; 1024-/subjects shows the full TopNav pill row (Subjects active dark pill, wordmark present) and NO bottom bar.
- Keyboard walk @360 on /subjects: 1) skip-link (moved on-screen at left:8px when focused), 2–4) content links inside main, 5–9) the five tab-bar Links last (DOM order), then only the dev-overlay portal.
- D-11 runtime probe: `/library`@360/1024 → Library active on both bars, Today NOT; `/`@360/1024 → Today; `/subjects/AI%20Agents`@390 → Subjects (prefix match); topnav/tabbar computed display swap none/flex correctly per width.

## Known Stubs
- TopNav Search button (`components/TopNav.js`): intentionally `disabled` with full-opacity `.btn-undone` styling and `title="Coming in a later update"` — the §9.1 not-yet-wired idiom; Phase 4 wires it (threat model T-02-08-02, accepted).
- TopNav notification dot + avatar chip: decorative `aria-hidden` markers by design (plan action; no fake affordances per D-11).

## User Setup Required
None — no external services.

## Next Phase Readiness
- 02-09 (Today) renders inside the new AppShell; its §12 row-3 phone layouts must clear the 56px bar (padding already provided) and fix the content overflow logged in deferred item 3.
- 02-11 imports `components/TabBar.js` directly for Listen/Session phone chrome (self-hiding component; render it as the last child of each screen wrapper).
- 02-12 re-runs the full sweep in both cookie states; notch/safe-area behavior on a real device remains flagged for human UAT (headless has no notch — Pitfall 6).

## Self-Check: PASSED

- Files exist: components/TabBar.js ✓, components/PhoneHeader.js ✓, components/TopNav.js ✓, components/AppShell.js ✓ (all verified on disk post-run)
- No git commits expected/attempted (commit_docs=false, instruction honored)
- All task acceptance criteria re-run: PASS (see Verification Results; `/` phone/tablet content overflow documented as out-of-fence, deferred item 3)

---
*Phase: 02-ui-design-responsive-overhaul · Plan 08*
*Completed: 2026-08-15*
