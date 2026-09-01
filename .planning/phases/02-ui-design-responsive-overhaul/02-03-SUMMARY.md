---
phase: 02-ui-design-responsive-overhaul
plan: 03
subsystem: ui
tags: [responsive-design, design-tokens, css-grid, auto-fit, flex-wrap, skeletons, empty-states, useviewport, next-navigation]

# Dependency graph
requires:
  - phase: 02-ui-design-responsive-overhaul (plan 01)
    provides: "the two-halves token system (app/globals.css :root vars + class layer, lib/tokens.js pill/card/statusPill/GLYPHS/useViewport) and scripts/check-viewports.mjs"
  - phase: 02-ui-design-responsive-overhaul (plan 02)
    provides: "AppShell dashboard chrome (canvas + 1440px column + TopNav) wrapping both subjects screens; the retired gate means deep links render ungated for fresh-profile captures"
provides:
  - "Responsive subjects index: single h1 (Display 32), featured colored tile + auto-fit list-tile grid (2-col wide → 1-col phone, zero JS), 5-tile skeleton + sr-only 'Sorting last night's haul…', verbatim §14.3 empty ('No subjects yet') and error copy, Retry as a real .btn-primary button"
  - "Responsive subject hub: hero (fluid clamp() padding, 2×2→4-across auto-fit stats) + 'Where it came from' 360px card beside it ≥~740px / stacked below on phone via flex-wrap; material cards 3-across→1-col; §9.9 crumb-link breadcrumb; Rename/Gemini/Rebuild as honest disabled .btn-undone buttons"
  - "Sources table → §9.5 stacked tinted cards on phone (the plan's one sanctioned useViewport DOM swap); ≥tablet keeps the 4-col grid with Caption 12 uppercase headers"
affects: [02-08 (TopNav/TabBar — owns the chrome overflow documented below), 02-09 (Today hub), 03 (data realism for SOURCE_ROWS), 04 (wiring Rename/Rebuild/Gemini behind real handlers)]

# Tech tracking
tech-stack:
  added: []  # zero deps (D-06); verification reused the existing playwright-core --no-save install
  patterns:
    - "Rung-1 restack: side-by-side panes via flex-wrap + flexBasis floors (hero '1 1 360px' / provenance '0 1 360px' + maxWidth:100%) — the 360px provenance card stacks under the hero with zero media queries"
    - "Rung-2 grids everywhere else: minmax(min(100%, Npx), 1fr) auto-fit for tiles (280), hero stats (110), material cards (240) — the min(100%,…) guard keeps the floor from overflowing at 320px content width (WCAG 1.4.10)"
    - "Fluid token padding: clamp(var(--space-md), 4vw, var(--space-xl)) gives §9.10's md-phone/xl-desktop hero padding without JS or a new class"
    - "useViewport reserved for the one structural DOM swap (sources table→cards); everything else collapses in CSS"

key-files:
  created: []
  modified:
    - "app/(dashboard)/subjects/page.js"
    - "app/(dashboard)/subjects/[subjectId]/page.js"
  deleted: []

key-decisions:
  - "minmax(min(100%, 280px), 1fr) instead of the plan's literal minmax(280px, 1fr) — same 2-col→1-col collapse, but the min() guard (the pattern 02-02's landing already established) prevents a 280px floor from overflowing at 320px zoom widths; applied to all three auto-fit grids (280/110/240)"
  - "Hero padding via clamp(var(--space-md), 4vw, var(--space-xl)) — §9.10 asks md on phone / xl on desktop and this is the zero-JS, zero-new-class way to get it (16px ≤ ~800px viewports, 32px above)"
  - "Sources table gap set to var(--space-sm2) at ALL widths (plan asked to tighten the gap to sm2 on tablet; without a media query per-file, one uniform sm2 keeps tablet tight and costs desktop only 4px vs the old 16px)"
  - "Index error copy uses §14.3 verbatim 'Couldn't load subjects — check the pipeline.' (the plan quotes it explicitly); detail keeps the existing 'Couldn't load — check the pipeline.' per §14.3's 'existing Retry pattern' row — straight apostrophes throughout so the acceptance greps match"
  - "White-on-color text sourced from tokens (tokens.color.surface) instead of raw '#fff' to honor the zero-raw-hex must-have; store-driven colors (subject.color, tileColor, breakdown item.color) stay dynamic per D-06/§7.4"
  - "'unread' source status falls through statusPill to the muted 'fetched' rung (SOURCE_ROWS is Phase 3 data; no new ladder rung invented)"

patterns-established:
  - "§9.5 table→card swap template: same SOURCE_ROWS data, two renderers behind one useViewport branch, role=list/listitem on phone with table semantics dropped consistently"
  - "Not-yet-wired action idiom on hub screens: <button type='button' disabled className='btn btn-{variant} btn-undone' title='Coming in a later update'> — full opacity, no fake onClick, Phase 4 replaces the disabled state with handlers"

requirements-completed: [UI-03, UI-04, UI-05]

# Metrics
duration: ~25 min
completed: 2026-08-15
---

# Phase 2 Plan 3: Responsive Subjects Screens Summary

**Subjects index + subject detail rebuilt on the token system: auto-fit tile/stat/material grids and flex-wrap hero restacking make both screens 360px-clean with zero JS, the sources table becomes §9.5 stacked cards on phone via the plan's single useViewport swap, and dead action spans became honest disabled `.btn-undone` buttons**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-08-15T04:17:00Z (approx)
- **Completed:** 2026-08-15T04:42:13Z
- **Tasks:** 2 (both auto, no checkpoints)
- **Files modified:** 2

## Accomplishments
- Subjects index: `h2 "Subjects"` is now the screen's single `<h1>` (Display 32), featured colored tile full-width (tokenized: on-color-chip track, amber fill, accent-tint read-% pill, dynamic store colors kept), others in a `repeat(auto-fit, minmax(min(100%,280px),1fr))` grid that reads 2-col on tablet/desktop and 1-col at 360px — zero media queries.
- All three §14.3 tone states on the index: loading = 5 skeleton tiles (1 full-width + 4 in the tile grid) with `aria-busy` + sr-only "Sorting last night's haul…"; empty = §9.7 idiom with GLYPHS.notebook icon tile, "No subjects yet" Heading 20, the verbatim body line, and a `btn-link` "Open your library →"; error = `role="alert"` + "Couldn't load subjects — check the pipeline." + Retry as a real `<button className="btn btn-primary">` (the onClick span is gone).
- Subject detail phone layout per §12 row 5: breadcrumb + wrapping action row (each crumb and pill ≥44px), hero stacking above the provenance card (flex-wrap does it), hero stats 2×2 at 360 / 4-across at 1440 from one auto-fit rule, material cards 1-col→3-across, and the sources table swapped to §9.5 stacked tinted cards (`role="list"`/`listitem`, title + statusPill on line 1, `author · saved` caption on line 2).
- Rename / Open in Gemini Notebook / Rebuild material are now `<button type="button" disabled className="btn btn-secondary|btn-primary btn-undone" title="Coming in a later update">` — full-opacity per §9.1, nothing faked, nothing POSTable (threat register T-02-03-03 satisfied); "View pathway" stays a Link and keeps primary-weight "Continue"/"Retake" + ghost "Listen/Read again/Review misses" launcher variants.
- Zero raw hex literals remain in either file (grep = 0); every surface comes from `var(--…)`/`lib/tokens.js`, with store-driven subject accents the only dynamic colors (D-06).
- D-11 fence verified: index 2 tile hrefs + detail fetch + 6 launcher/action hrefs all still `encodeURIComponent`'d (detail grep count 7 = fetch + 6 Links), `fetchSubject` keeps null-on-404, `if (!name || subject === null) notFound()` untouched — `/subjects/DoesNotExist` renders the "Nothing here" client 404.

## Task Commits

Not committed — commit skipped (commit_docs=false). All changes left uncommitted in the working tree per the orchestrator's sequential-execution instruction.

## Files Created/Modified
- `app/(dashboard)/subjects/page.js` — rewritten: h1 header, auto-fit tile grid, skeleton/empty/error states, tokenized tiles, Retry button
- `app/(dashboard)/subjects/[subjectId]/page.js` — rewritten: crumb-link breadcrumb, .btn-undone action row, §9.10 hero (clamp padding, 2×2 stats), flex-wrap provenance restack, 3 material cards with .btn launchers, §9.5 phone source cards / 4-col tablet+ table, skeleton + error states; guards and all Phase 1 hrefs unchanged

## Decisions Made
- See key-decisions frontmatter (min() grid guards, clamp() hero padding, uniform sm2 table gap, per-screen error copy sourcing, tokens.color.surface for on-color text, unread→fetched statusPill fallback).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Auto-fit grid floors could overflow at zoom widths**
- **Found during:** Task 1 (writing the tile grid)
- **Issue:** The plan's literal `minmax(280px, 1fr)` (and 240/110 floors) sets an unbreakable min — at 320px content width (WCAG 1.4.10 zoom acceptance, §10) a 280px floor overflows its container
- **Fix:** Wrapped every floor in `min(100%, Npx)` — the pattern 02-02's landing grids already established; identical 2-col→1-col behavior at all acceptance widths
- **Files modified:** both page files
- **Verification:** content-scoped sweep clean at 360/390/768/1024/1440 (screenshots inspected at 360 + 1440)
- **Committed in:** n/a (commit_docs=false)

**2. [Acceptance-criterion scoping] Document-level viewport sweep cannot report "no overflow" until 02-08 lands**
- **Found during:** Task 1 acceptance (first sweep: OVERFLOW 414px/384px/6px at 360/390/768 on all three routes)
- **Issue:** The overflow is 100% TopNav (`components/TopNav.js` — its logo+tabs+icons row has ~774px min-content and no responsive rules yet). Fixing it requires editing a file outside this plan's files_modified; TopNav→bottom-tab-bar is plan 02-08's deliverable. Note: the 02-01 "baseline" only swept 3 routes ×5 widths (15 captures), so `/subjects` was never in a clean baseline — this chrome overflow predates Phase 2's per-screen plans
- **Fix (verification, not code):** ran a content-scoped assertion that hides the AppShell's TopNav and asserts everything else fits — all 3 routes × 5 widths clean; a per-element audit confirmed zero page-content elements exceed the viewport
- **Files modified:** none (throwaway script /tmp/check-content.mjs)
- **Verification:** `SCREEN CONTENT CLEAN AT ALL WIDTHS` for /subjects, /subjects/AI%20Agents, /subjects/DoesNotExist; document-level sweep expected to go green when 02-08's responsive nav lands
- **Committed in:** n/a

---

**Total deviations:** 2 (1 auto-fixed grid-floor bug, 1 verification-scoping note)
**Impact on plan:** No scope creep — the screens themselves meet the 360px acceptance; the remaining document-level overflow is pre-existing chrome owned by 02-08, handled exactly as 02-02 documented Today's overflow for 02-09.

## Issues Encountered
- TopNav chrome overflow (above) — out of this plan's file scope, forwarded to 02-08 via the Deviations section and this summary's Next-Phase notes.
- The screenshot-analysis MCP couldn't parse the re-hosted capture URLs; used the Read tool's direct image rendering + a second analysis pass instead. Verification-only; no repo impact.

## Known Stubs
- `SOURCE_ROWS` remains the Phase 1 mock list (plan-mandated fence: "Keep SOURCE_ROWS as-is — data realism is Phase 3, DATA-01"); the 'unread' status renders via statusPill's fetched fallback rung.
- Rename / Open in Gemini Notebook / Rebuild material are intentionally inert disabled buttons (`title="Coming in a later update"`) — Phase 4 (CAPT-01..03) wires them; this is the §9.1 honest idiom, not a dead span.

## Threat Flags

None — no new security surface. T-02-03-01: `grep -rn dangerouslySetInnerHTML app components` still empty; all subject data renders as escaped JSX. T-02-03-02: outbound fetch keeps `encodeURIComponent` + decode-in-try/catch + null-on-404 → `notFound()` verbatim. T-02-03-03: the three disabled buttons have no onClick and cannot invoke anything.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Both subjects screens are token-driven and 360px-clean (content-scoped); the document-level no-overflow assertion for these routes will pass once 02-08 makes TopNav responsive/collapsible.
- The §9.5 table→cards swap pattern and the .btn-undone not-yet-wired idiom are established for reuse by 02-04..02-07 (Library's six-column table is the big consumer).
- Phase 3 can replace SOURCE_ROWS / provenance copy without touching layout; Phase 4 swaps the disabled buttons for handlers in place.

## Verification Log
- `npm run build`: exit 0 after each task and after the final token edits (17 routes, no new errors)
- Task 1 chain: `SUBJECTS-INDEX-OK` — "No subjects yet", "Sorting last night's haul…", `className="skeleton"`, `<h1` present; encodeURIComponent count 3 (2 hrefs + 1 comment); no "Loading…"; `role="alert"` present
- Task 2 chain: `SUBJECT-DETAIL-OK` — useViewport, crumb-link, btn-undone (count 4 = 3 class usages + 1 comment), "Opening the notebook…", notFound(), SOURCE_ROWS present; encodeURIComponent count 7 (fetch + 6 launcher/action Links); no "Loading…"
- Viewport sweep (port 3195, this plan's assigned scratch port): document-level `OVERFLOW 414/384/6px at 360/390/768` on all three routes = TopNav only; content-scoped (TopNav hidden): **all 3 routes × 5 widths clean**, exit 0
- Captures: `/tmp/02-03-subjects-360.png` (fresh profile — renders the subjects screen, no redirect, gate retirement confirmed) and `/tmp/02-03-subjects-360-final.png`; nav-hidden layout captures `/tmp/02-03-subjects-360-nochrome.png`, `/tmp/02-03-subjects-1440-nochrome.png`, `/tmp/02-03-detail-360.png`, `/tmp/02-03-detail-1440.png`; sweep captures under `/tmp/shots/`
- 360 detail capture confirms: 2×2 hero stats, wrapped 44px action pills, 1-col material cards, tinted §9.5 source cards with done/unread pills (not a 4-col grid), no clipping
- 1440 detail capture confirms D-05 proportions: hero + 360px provenance side by side, 4-in-row stats, 3-across material cards, 4-col uppercase-header table
- D-11: `/api/subjects` → 3 subjects (AI Agents, Distribution, Sales) all rendered ("3 notebooks" + 3 tiles); `/subjects/DoesNotExist` renders the "Nothing here" client 404; `grep -rn "Loading…" app/(dashboard)/subjects/` empty; no dangerouslySetInnerHTML anywhere
- Dev server killed; port 3195 clear

## Self-Check: PASSED

- Files present: `app/(dashboard)/subjects/page.js`, `app/(dashboard)/subjects/[subjectId]/page.js` (FOUND via `[ -f ]`)
- No modifications outside files_modified: only those two files + this SUMMARY differ from the pre-plan tree (git status of the learnit subtree shows no other Phase-2-plan-03 changes; /tmp scripts are throwaway)
- `npm run build` exits 0 in final state
- Both task verify chains and all satisfiable acceptance criteria executed above (PASS); the document-level sweep criterion is scoped to 02-08 per Deviation 2

---
*Phase: 02-ui-design-responsive-overhaul*
*Completed: 2026-08-15*
