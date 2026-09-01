---
phase: 02-ui-design-responsive-overhaul
plan: "06"
subsystem: ui
tags: [responsive, tanstack-react-table, design-tokens, accessibility, empty-states]

# Dependency graph
requires:
  - phase: 02-ui-design-responsive-overhaul (02-01)
    provides: the two-halves token system (globals.css :root + class layer, lib/tokens.js pill/card/statusPill/useViewport/GLYPHS)
  - phase: 02-ui-design-responsive-overhaul (02-02)
    provides: AppShell dashboard chrome, scripts/check-viewports.mjs sweep tool, viewport export
provides:
  - Responsive Library screen — 2-col phone stats (failed card spanning), 44px wrapping filter pills, §9.5 table→stacked-card swap below 768, semantic role=table/aria-sort grid at ≥768
  - The §8 flagship empty state ("Nothing saved yet" + /onboarding ghost pill) and §14.3 loading/error/empty-filter states, verbatim
  - The §9.5 table→card idiom reference that plan 02-03's subject-detail sources table reuses (UI-05)
affects: [02-ui-design-responsive-overhaul (02-03 subject detail reuses the idiom), 04-capture-interactions (Phase 4 wires Search/Export/Save)]

# Tech tracking
tech-stack:
  added: []   # zero new dependencies (D-06)
  patterns:
    - "Presentation-swap over a live headless table: keep the useReactTable instance (sort/filter/row model), branch only the RENDERER on useViewport() — desktop flexRender grid vs phone row.original cards (02-RESEARCH Pattern 3 rung 4)"
    - "Consistent role model per width: role=table/row/cell/columnheader + aria-sort + sr-only caption ≥768; role=list/listitem with headers dropped <768"
    - "Honest disabled pills: disabled + .btn-undone (undimmed) + title tooltip, no handlers — no dead spans (D-11), no fake function"

key-files:
  created: []
  modified:
    - app/(dashboard)/library/page.js

key-decisions:
  - "Filter pill ownership per plan: inactive pills take .btn-ghost for its hover; the ACTIVE pill drops the variant class and owns ink colors inline — the old one-off failed-pill danger tint was dropped for the unified idiom (failed-count suffix kept)"
  - "Phone §9.5 cards get a 1px var(--color-border) hairline so the surface-bg cards read as cards on the white table card (§5 separation-by-hairline); plan specified surface bg + r-lg only"
  - "Stats grid uses minmax(min(100%, 180px), 1fr) — the sibling-established 320px-content guard (02-04 subjects TILE_GRID); identical behavior ≥180px"
  - "The §8 empty-table state replaces the whole card content (filters with all-zero counts serve nothing); the empty-FILTER state keeps the filter row so the user can switch back"
  - "SortableHeader span→button (font:inherit reset) so the global :focus-visible ring covers sort toggles; aria-sort renders only on the actively sorted column"

patterns-established:
  - "Pattern: role=table semantic grid ≥768 / role=list §9.5 cards <768 sharing one react-table instance — reusable by 02-03's subject sources table"
  - "Pattern: §14.3 forced-state verification via playwright route interception (stall for loading, 500 for error — mind react-query's default 3 retries ≈ 8s, empty arrays for §8)"

requirements-completed: [UI-03, UI-04, UI-05]

# Metrics
duration: ~40min
completed: 2026-08-15
---

# Phase 2 Plan 06: Responsive Library Screen Summary

**Library at 360px: 2-col stats with the failed card spanning, 44px wrapping filter pills, and §9.5 stacked row cards (title + status pill, meta line, failed error line) — while the untouched @tanstack/react-table instance keeps owning sort/filter underneath the swapped renderer**

## Performance

- **Duration:** ~40 min (context + implementation 23:22, verification through 23:30 UTC+8 session time)
- **Tasks:** 2/2
- **Files modified:** 1 (`app/(dashboard)/library/page.js` — the only file in `files_modified`; everything else read-only)

## Accomplishments

- Phone library is cards, not a shrunken spreadsheet: 6 listitem cards at 360px (DOM-verified), no column headers <768, failed rows carry the §9.5 error line (visible "error: …" text + danger-text Caption), title ellipsized with `minWidth: 0` everywhere.
- Desktop/tablet (≥768) upgraded to §11.3 semantics: `role="table"` + sr-only caption "Your saved links", `role="columnheader"` with `aria-sort` (ascending/descending as toggled), `role="row"/"cell"`, Caption-12 uppercase headers, divider hairlines — GRID_COLUMNS proportions preserved (D-05; visually confirmed at 1024: 6-col grid, 5-across stats, headers present).
- §8 flagship empty state landed VERBATIM ("Nothing saved yet" + "Send your first link — …" + ghost pill "See the four doors" → `/onboarding`) and §14.3 states replaced bare "Loading…"/"Failed to load library."/"No rows match this filter." with 6 skeletons + sr-only "Fetching your saves…", `role="alert"` + "Couldn't load the library — check the pipeline." + Retry (wired to useQuery `refetch`), and "Nothing at this stage right now." + "Switch filters or check back after tonight's run.".
- Action pills became honest §9.1 controls: three `disabled` `.btn-undone` buttons (undimmed, `title="Coming in a later update"`, no handlers) — D-11 preserved: no navigation-labeled dead spans.
- Data logic untouched in spirit and letter: same `columns` accessors + sort toggles, same `counts`/`filteredData` useMemos, same `useReactTable` wiring, `formatAdded` and `GRID_COLUMNS` kept — behavior parity proven by live smoke (filter "new" narrows 6→1 rows all status=new; Title header toggles ▲/▼ with aria-sort ascending→descending and reorders).

## Task Commits

None — `commit_docs: false` for this project (repo root is the shared parent `yahshua` monorepo; the learnit tree is untracked there). Per orchestrator hard rules, no git commits were made; verification artifacts are this SUMMARY plus the modified file itself.

## Files Created/Modified

- `app/(dashboard)/library/page.js` — full presentation rewrite over the preserved data logic (header/actions, stats grid, filter pills, §8/§14.3 states, viewport-swapped table renderer, tokenized cells via `statusPill`/`pill`/`card`/`tokens` from `lib/tokens.js`).

## Decisions Made

See key-decisions above. Additionally: the `useQuery` destructure gained `refetch` (plan-mandated for the Retry button); the error state renders left-aligned per §9.8; the empty-filter state reuses the §9.7 icon-tile idiom with `GLYPHS.search` minus the CTA.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Viewport sweep overflow is the shared TopNav chrome, not the Library page**
- **Found during:** Task 2 acceptance (viewport sweep)
- **Issue:** `node scripts/check-viewports.mjs --port 3198 --routes /library` reports OVERFLOW 415px @360, 385px @390, 7px @768 (clean @1024/1440). DOM measurement isolated every offender to `components/TopNav.js` (the `TodaySubjectsListenLibraryPipeline` tab row and the `⌕◔▾` cluster, 775px min width) — the PRE-EXISTING issue documented in `deferred-items.md` §1 (found during 02-04, identical on every `(dashboard)` route, owner plan 02-08, which adds the phone chrome and collapses TopNav ≥768).
- **Fix:** Not fixable inside this plan — `files_modified` lists only `app/(dashboard)/library/page.js` (hard constraint; TopNav is 02-08's file). Followed the 02-04 protocol instead: re-swept with the deferred TopNav hidden via DOM — **Library content is CLEAN (0px overflow) at 360/390/768/1024/1440**. The sweep's exit-1 residuals match the documented baseline exactly (414/384/6px in 02-04's report vs 415/385/7px here).
- **Files modified:** none (out of scope, logged not fixed — deferred-items.md §1 already tracks it)
- **Verification:** `LIBRARY CONTENT CLEAN AT ALL WIDTHS` (360/390/768/1024/1440, 0px each); offender isolation listing only TopNav elements

**2. [Rule 1 - Bug] Apostrophe entities would have failed the plan's verbatim-copy greps**
- **Found during:** Task 1 implementation
- **Issue:** JSX source written with `&apos;` would make `grep -q "Couldn't load the library"` fail (§14.3 copy must be grep-able verbatim).
- **Fix:** Raw apostrophes in the JSX text (`Couldn't`, `tonight's`).
- **Verification:** Task 1 grep suite prints `LIBRARY-STATES-OK`.

---

**Total deviations:** 2 (1 out-of-scope blocker documented per protocol, 1 self-caught bug fixed inline)
**Impact on plan:** None on scope or behavior — the Library page itself meets every criterion; the overflow residual is the shared-chrome baseline awaiting 02-08.

## Verification Evidence

- `npm run build` — passes (all routes compiled; /library static).
- Task 1 automated: `LIBRARY-STATES-OK` (§8 "Nothing saved yet"/"Send your first link"/"See the four doors", §14.3 "Fetching your saves"/"Couldn't load the library"/"Nothing at this stage right now", `btn-undone` ×4 ≥ 3, `role="alert"`, no "Loading…").
- Task 2 automated: `LIBRARY-TABLE-OK` (useViewport, aria-sort, "Your saved links", `role="list"`, statusPill, useReactTable all present).
- Acceptance (playwright-core on system Chrome, port 3198): 360 → 6 stacked cards, 0 column headers, failed card error line present, filter pills all 44px in a wrapped 2-row (96px) row, 3 disabled action pills; 1024 → semantic table + sr-only caption, 6 columnheaders, 6 rows × 6 cells, 0 cards; filter smoke 6→1; sort smoke ascending→descending with row reorder. Stats geometry: 4×144px + failed ink card spanning 300px with `#ff8a5c` numeral.
- Forced states (route interception): loading = aria-busy + 6 skeletons + sr-only copy, no bare text; error = `role="alert"` + §14.3 copy + Retry (renders after react-query's default 3 retries ≈ 8s); empty table = §8 verbatim + ghost pill; empty filter = §14.3 informational copy. Screenshots: `/tmp/shots/360-library.png`, `/tmp/shots/1024-library.png`, `/tmp/shots/empty-library.png`.
- Dev server on port 3198 killed after verification; port confirmed free.

## Issues Encountered

- The two screenshot-dependent acceptance criteria were checked with the deferred TopNav hidden (frames otherwise shift ~415px at 360); both the visual captures and the DOM assertions agree. Chrome headless `--screenshot`-style CDN uploads made eyeballing awkward — DOM assertions (widths, roles, computed colors) were used as the primary evidence, with visual confirmation via image analysis of both shots.

## User Setup Required

None — no external services.

## Known Stubs

- `app/(dashboard)/library/page.js` lines 263-287: "⌕ Search transcripts", "Export CSV", "+ Save a link" are intentionally `disabled` (`.btn-undone`, title "Coming in a later update") — §9.1's honest not-yet-wired idiom; Phase 4 (CAPT-01..03) wires them. Data rendering itself has no stubs: every row field comes from `/api/library` via the untouched useQuery.

## Next Phase Readiness

- Library meets UI-03 at 360px (content-level), UI-04 (§8/§14.3 verbatim), and contributes the UI-05 table→card idiom that 02-03 (subject detail sources table) reuses.
- Phase-wide blocker unchanged: TopNav phone chrome (02-08) must land before the OFFICIAL check-viewports sweep can report zero overflow on any (dashboard) route — deferred-items.md §1.

## Self-Check: PASSED

- Key file modified exists: `app/(dashboard)/library/page.js` (FOUND, only file changed — `git status` clean apart from pre-existing untracked tree state).
- All Task 1 + Task 2 automated verify commands: PASS (`LIBRARY-STATES-OK`, `LIBRARY-TABLE-OK`, build exit 0).
- Acceptance criteria re-run consolidated: all PASS (see Verification Evidence); the "zero overflow" criterion passes at content level with the documented TopNav baseline explicitly logged above.
- Commits: none expected (`commit_docs: false`) — verified intentional.

---
*Phase: 02-ui-design-responsive-overhaul*
*Completed: 2026-08-15*
