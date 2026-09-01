---
phase: 02-ui-design-responsive-overhaul
plan: "04"
subsystem: ui
tags: [responsive, design-tokens, pathway, print, next-16, react-19]

# Dependency graph
requires:
  - phase: 02-ui-design-responsive-overhaul (plans 01-02)
    provides: token system (globals.css :root + lib/tokens.js factories/hooks), .btn-*/.crumb-link/.scroll-snap-x/.no-print/.print-row class layer, AppShell chrome
provides:
  - Responsive pathway screen (§12 row 6): phone dot rail 28px/12px dots, snap-scrolling subject chips, phone "Move up"/"Move down" 44px Ghost pair, rail-below-stages <1024px, §14.3 loading/empty/error states
  - Print/export sheet joined to the visual system (§12 row 13, D-08): token colors/type scale, .no-print back link, .print-row break-inside rules, maxWidth 100% + clamp padding
  - Reduced-motion-aware #active-stage scroll ("Continue where you left off" is now a real button, matchMedia-gated behavior auto/smooth)
affects: [02-09 (Today deep-links /pathway/{id}#active-stage), 02-12 (FLOW matrix + final sweep)]

# Tech tracking
tech-stack:
  added: []   # zero new dependencies (D-06)
  patterns:
    - "useViewport() rung-4 structural swap for rail placement (row ≥1024 / column below) and rail metrics (64/14/3 vs 28/12/2)"
    - "Server components consume tokens via var(--*) CSS custom properties — a JS import of lib/tokens.js fails next build (Turbopack rejects the useSyncExternalStore transitive import in RSC)"
    - "Sanctioned in-container horizontal scroll: .scroll-snap-x + .snap-item chips (page never scrolls sideways)"

key-files:
  created: []
  modified:
    - "app/(dashboard)/pathway/[subjectId]/page.js"
    - "app/pathway/[subjectId]/print/page.js"

key-decisions:
  - "Print page sources token VALUES through var(--color-*) / var(--space-*) / var(--radius-*) instead of importing lib/tokens.js — the plan-prescribed import is impossible in a Server Component on Next 16.3.1 (empirically proven build failure; react-server build has no useSyncExternalStore)"
  - "Pathway page keeps every Phase 1 wire byte-equivalent (6 encoded hrefs, notFound() guard shape, per-subject orders state, #active-stage anchor id)"
  - "Print dots keep the circle token (var(--radius-circle)) matching the app timeline-dot idiom; the sheet keeps square-edged stage rows for print fidelity with r-lg on the outer sheet"

patterns-established:
  - "Phone reorder idiom: two flex:1 Ghost pills ('Move up'/'Move down') replacing arrow glyph pairs; desktop/tablet keep compact glyphs but as labeled 44×44 aria-label'd buttons"
  - "Out-of-scope overflow logging to deferred-items.md (TopNav overflow is 02-08's phone-chrome scope)"

requirements-completed: [UI-03, UI-04, UI-05]  # this plan's contribution: pathway + print screens' share of these phase-level requirements

# Metrics
duration: ~45min (verification + completion of an interrupted run's implementation)
completed: 2026-08-15
---

# Phase 2 Plan 4: Responsive Pathway + Print Sheet Summary

**Pathway screen rebuilt responsive (28px phone dot rail, snap chips, 44px Move up/Move down Ghost pair, rail below stages <1024px, §14.3 states) and the print/export sheet token-joined (D-08) with real @media print rules — zero Phase 1 wires touched**

## Performance

- **Duration:** ~45 min
- **Started:** 2026-08-15 (continuation of an interrupted run whose file edits were already on disk)
- **Completed:** 2026-08-15T14:57Z
- **Tasks:** 2/2
- **Files modified:** 2

## Accomplishments
- Pathway is thumb-usable at 360px: dot rail shrinks 64→28px (14→12px dots), stages single-column, active-stage reorder becomes a full-width "Move up"/"Move down" Ghost pair, subject chips scroll-snap inside their own container, right rail (builds-from + certificate) drops below stages under 1024px, hero stacks stats below copy with a 100%/max-220px lime progress bar.
- "Continue where you left off" is a real `<button>` whose scrollIntoView respects prefers-reduced-motion (`behavior: matchMedia(...) ? 'auto' : 'smooth'`); the #active-stage anchor survives for 02-09's deep link.
- Print/export sheet joins the system (D-08): token colors (ink 2px header/footer rules, border stage dividers, text-secondary meta), §6 type scale (Display 32 h1, Heading 20 stage titles, Caption eyebrows), sheet r-lg on screen, `clamp(16px,4vw,40px)` outer padding, maxWidth 100%; @media print hides the back link (.no-print), prints white, and avoids page breaks inside stage rows (.print-row).
- §14.3 states: loading = 4 stage skeletons + sr-only "Laying out your reading path…"; error = role="alert" + "Couldn't load — check the pipeline." + Retry primary; empty = "Pathway not built yet" + guidance + encoded "Back to subject →" link.

## Task Commits

None — `commit_docs` is false and the learnit tree is untracked in the shared parent monorepo (per STATE.md and this run's hard rules: no git commits). Work exists as working-tree changes to the two `files_modified` paths only.

## Files Created/Modified
- `app/(dashboard)/pathway/[subjectId]/page.js` — responsive pathway (client): token hero, snap chips, compact vertical timeline, phone/desktop reorder controls, rail swap via useViewport, §14.3 states, all D-11 wires preserved.
- `app/pathway/[subjectId]/print/page.js` — token-styled print sheet (server): styling-only change; `await params`, decode try/catch → notFound(), getSubjectById guard, encoded back link, export date all byte-equivalent to Phase 1.

## Verification Evidence (plan `<verification>` + acceptance criteria)

- `npm run build` — PASSES (final run 2026-08-15T14:57Z, 15/15 pages, zero errors).
- Task 1 greps: `Move up` ✓, `scroll-snap-x` ✓, `prefers-reduced-motion` ✓, `Laying out your reading path` ✓, `Pathway not built yet` ✓, `useViewport` ✓, `aria-label="Move stage up"` ✓, `encodeURIComponent` count = 6 (≥6 ✓: breadcrumb, print, listen, chips, quiz hop, empty-state link).
- Task 2 greps: `no-print` ✓, `print-row` ✓, `lib/tokens.js` referenced ✓ (see Deviation 1 for why it is a comment, not an import), `notFound()` ✓, `encodeURIComponent` ✓.
- Viewport sweep (`scripts/check-viewports.mjs --port 3196`, widths 360/390/768/1024/1440): `/pathway/AI%20Agents/print` and page-isolated pathway are CLEAN at all five widths. `/pathway/DoesNotExist` renders the 404 UI ("Nothing here / This screen does not exist") — see Deviation 2 for the TopNav shared-chrome overflow at 360/390/768 (page content itself contributes zero overflow; isolated scrollWidth equals viewport at every width).
- Live click checks (playwright-core, 360px, reducedMotion reduce): "Continue where you left off" scrolled #active-stage from viewport-top 1253 → 0 instantly (behavior 'auto' under reduced motion) ✓; "Move up" on the active stage reordered [1,2,3,4] → [1,3,2] ✓; switching to Distribution via chip showed Distribution's own natural order (no cross-subject contamination — the per-subject keying's purpose) ✓; zero page errors.
- Print checks: `curl /pathway/Distribution/print` → `no-print` present (back link) ✓; `curl -w %{http_code} /pathway/Nope/print` → **404** ✓ (server guard); `page.emulateMedia({media:'print'})` → back link `display:none`, `break-inside: avoid` on stage rows, body white (`rgb(255,255,255)`); screenshot at `/tmp/02-04-print-emulated.png`; phone screenshot at `/tmp/shots/360-pathway_AI_Agents.png` (narrow dot rail, full-width Move up/Move down pair on the active stage, rail cards below the timeline).
- D-11 spot checks: breadcrumb "Subjects"/"{subject}" are Links (`.crumb-link`, encoded) ✓; "⎙ Print / export" Link → encoded `/pathway/{id}/print` ✓; "♪ Switch to Listen" Link → encoded `/listen?subject=` ✓; stage "Review" Link → encoded `/quiz?subject=` ✓; `if (!name || (subjects && !subject)) notFound()` guard intact ✓ (client route renders the 404 UI per the Phase 1 client-notFound pattern; print route returns HTTP 404).

## Decisions Made
- Kept the interrupted run's implementation after verifying it against every acceptance criterion (per continuation rules) rather than rewriting; my net code deltas were a scratch-import revert and one token-purity change (`'50%'` → `var(--radius-circle)` on print dots).
- Desktop/tablet reorder keeps compact glyphs but as real labeled 44×44 buttons (`aria-label="Move stage up/down"`, surface-tint, r-sm, cursor pointer) per §10 — the old 24×20 spans are gone at every width.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `lib/tokens.js` import in the print Server Component is impossible — tokens arrive via CSS vars instead**
- **Found during:** Task 2 (print sheet)
- **Issue:** Plan action 1 prescribes `import { tokens } from '../../../../lib/tokens.js'`; the Turbopack build fails: "You're importing a module that depends on `useSyncExternalStore` into a React Server Component module. This API is only available in Client Components." (React 19.2.8's react-server build does not export `useSyncExternalStore` — verified directly against `react.react-server.js` and by a live build test.)
- **Fix:** Token VALUES reach the page via the other half of 02-01's two-halves system: `var(--color-*)` / `var(--space-*)` / `var(--radius-*)` custom properties, which `app/globals.css` mirrors 1:1 from `lib/tokens.js`; §6 type roles spelled at their token values. The plan itself sanctioned this equivalence ("`background:'var(--color-surface)'` (or `#fff` via `tokens.color.surface`)"). A header comment in the file documents the mechanism.
- **Files modified:** `app/pathway/[subjectId]/print/page.js`
- **Verification:** `npm run build` passes; rendered sheet verified token-colored in the print-emulation screenshot.
- **Committed in:** N/A (commit_docs false)

**2. [Scope boundary] Viewport sweep overflow at 360/390/768 comes from shared TopNav chrome (02-08's scope), not this plan's files**
- **Found during:** Task 1 acceptance sweep
- **Issue:** 414px overflow @360 / 384px @390 / 6px @768 — identical on `/pathway/DoesNotExist` (404) and every dashboard route; DOM isolation proved the pathway page's own scrollWidth equals the viewport at ALL five widths (with TopNav hidden: 360/390/768/1024/1440 exactly). Culprit: Phase 1 `components/TopNav.js` fixed-width clusters (464px tabs + 160px utilities); `components/AppShell.js` documents that phone chrome deliberately arrives in plan 02-08.
- **Fix:** Logged to `deferred-items.md` (item 1) for 02-08; print route (outside the dashboard group) is fully clean. Per this run's hard rules all non-plan files are read-only, and the executor scope boundary forbids fixing unrelated files.
- **Files modified:** none (this plan's two files contribute zero overflow)
- **Verification:** DOM-measured isolation at all five widths; sweep output in transcript.
- **Committed in:** N/A

---

**Total deviations:** 2 (1 blocking auto-fix, 1 documented out-of-scope discovery)
**Impact on plan:** All acceptance criteria that belong to this plan's files pass. The sweep criterion "no overflow at 360–1440" is satisfied by the pages themselves; the residual overflow is pre-existing shared chrome scheduled for 02-08 and re-checked by 02-12's phase-final sweep.

## Known Stubs

All mock data is the sanctioned Phase 3 fence ("Data stays mock" per the plan's Objective) — none block the plan goal:
- Active-stage checklist items and timings ("Read the briefing doc · 6 min" etc.) and the 44% checklist progress bar — hardcoded Phase 1 mock (`app/(dashboard)/pathway/[subjectId]/page.js`, showChecklist block).
- "This stage builds from" source names/thumbnails and "+N more sources" — store mock fields (`source1`/`source2`/`moreSourcesCount`).
- Certificate progress = same done/total percentage as the hero (single source, mock until Phase 3).

## Authentication Gates

None.

## Threat Flags

None — no new network surface, auth paths, file access, or schema changes beyond the plan's threat model (T-02-04-01..04 all remain `accept` with guards preserved; JSX text only, no `dangerouslySetInnerHTML`).

## Issues Encountered
- The plan's `<interfaces>` block (and `lib/tokens.js`'s header comment) wrongly claim server components can import token values from `lib/tokens.js`; disproven empirically and logged to `deferred-items.md` item 2 for future plans (02-02's `app/not-found.js` D-08 work should also use CSS vars).
- Client `notFound()` on `/pathway/DoesNotExist` returns HTTP 200 on the initial SSR pass (subjects not yet fetched) and renders the 404 UI after hydration — the unchanged Phase 1 client-guard pattern; the server print route returns a true HTTP 404.

## User Setup Required
None.

## Next Phase Readiness
- 02-09 can deep-link `/pathway/{id}#active-stage` and rely on the "Continue where you left off" button + reduced-motion-aware scroll machinery.
- 02-12's phase-final sweep will show the TopNav overflow until 02-08 lands (see deferred-items.md).
- Ready for 02-05.

## Self-Check: PASSED

- Files exist: `app/(dashboard)/pathway/[subjectId]/page.js` ✓, `app/pathway/[subjectId]/print/page.js` ✓, `02-04-SUMMARY.md` ✓, `deferred-items.md` ✓
- Commits: N/A — commit_docs=false for this run (verified no commits made: working tree carries the changes)
- Acceptance criteria re-run: all pass (evidence above)

---
*Phase: 02-ui-design-responsive-overhaul*
*Completed: 2026-08-15*
