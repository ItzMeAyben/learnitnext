---
phase: 02-ui-design-responsive-overhaul
plan: 01
subsystem: ui
tags: [design-tokens, css-custom-properties, globals-css, responsive, accessibility, focus-visible, playwright-core, use-sync-external-store]

# Dependency graph
requires:
  - phase: 01-connect-screens
    provides: the 14 connected screens, AppShell/TopNav chrome, and lib/store.js surface that Phase 2 restyles against this token contract
provides:
  - ":root token custom properties in app/globals.css — every §4 spacing, §5 radius/elevation, §7.2 palette token (34 colors, 10 spaces, 7 radii, 2 font stacks, shadow-bar)"
  - "Interaction-state class layer in app/globals.css — focus-visible ring (+.on-dark lime swap), .skip-link, .btn/.btn-primary/secondary/ghost/danger/link/.btn-undone, .tabbar/.tabbar-item/.tab-item/.topnav, .only-phone/.only-tablet/.only-desktop, .crumb-link, .skeleton+shimmer, .scroll-snap-x/.snap-item, @media print, prefers-reduced-motion"
  - "lib/tokens.js — JS token mirror + pill()/card()/statusPill() factories (layout-only, per the ownership rule), GLYPHS, SSR-safe useMediaQuery/useViewport (useSyncExternalStore, getServerSnapshot false)"
  - "scripts/check-viewports.mjs — one-line headless viewport sweep (playwright-core, system Chrome, learnit_onboarded cookie injection, overflow assertion at 360/390/768/1024/1440, screenshots, exit 0/1/2)"
affects: [02-02, 02-03, 02-04, 02-05, 02-06, 02-07, 02-08, 02-09, 02-10, 02-11, 02-12]

# Tech tracking
tech-stack:
  added: []  # zero runtime deps (D-06); playwright-core installed ad hoc with --no-save (verification-only)
  patterns:
    - "Two-halves token system: every token exists as a :root custom property AND a JS constant; value-for-value mirror"
    - "Ownership rule (state-touched properties are class-owned; inline = layout): pill() returns no background/color, encoded as a comment at the top of the class layer"
    - "SSR-safe media queries via useSyncExternalStore with getServerSnapshot () => false; useViewport calls both hooks unconditionally"
    - "display is class-owned on .tabbar/.topnav and visibility helpers use display:none !important so inline styles cannot defeat breakpoint hiding"

key-files:
  created:
    - lib/tokens.js
    - scripts/check-viewports.mjs
  modified:
    - app/globals.css

key-decisions:
  - "Class-owned display on .tabbar (resting display:flex) and .topnav (display:none below 768, flex ≥768): without a class-owned resting display, any inline display on the consuming TabBar/TopNav would defeat the plan's hide rules (inline beats class)"
  - "Visibility helpers hide-only with display:none !important per D-04 range: a show value like display:initial would render divs inline (CSS initial), and !important guards against the app's inline-style idiom keeping hidden panes visible; when a helper's range is active no rule fires so inline display applies"
  - ".btn-danger:hover background #f2dbd1 = danger-tint darkened 5%, implementing UI-SPEC §9.1's hover row the plan's action referenced"
  - "statusPill falls back to the muted fetched rung for unknown statuses instead of crashing on tokens.status[undefined]"
  - "playwright-core kept out of package.json AND package-lock.json (verified diff-clean after npm install --no-save)"

patterns-established:
  - "Inline = layout, class = state: screens take className for hover/focus/active/aria-current/breakpoint behavior and inline tokens for everything else"
  - "Viewport verification one-liner for every later plan: start dev server on a scratch port, run scripts/check-viewports.mjs --port <n> --routes <plan's routes>"
  - "exit 0 = ALL VIEWPORTS CLEAN · exit 1 = <n> failures (OVERFLOW lines) · exit 2 = playwright-core missing"

requirements-completed: [UI-05, UI-03]

# Metrics
duration: 4 min
completed: 2026-08-15
---

# Phase 2 Plan 1: Token Foundation Summary

**Two-halves design-token system (34-color :root custom properties + JS mirror with layout-only style factories), the §9/§10 interaction-state class layer, and the shared headless viewport-sweep tool — zero new runtime dependencies**

## Performance

- **Duration:** 4 min
- **Started:** 2026-08-15T04:10:05Z
- **Completed:** 2026-08-15T04:14:05Z
- **Tasks:** 3
- **Files modified:** 3 (app/globals.css rewritten, lib/tokens.js new, scripts/check-viewports.mjs new)

## Accomplishments
- app/globals.css grew from the 3-line reset to a 286-line token + class layer: full `:root` token set (values verbatim from UI-SPEC §4/§5/§7.2), global `:where()` focus ring with the dual `.on-dark:focus-visible, .on-dark :focus-visible` lime swap, skip link, all five button variants + `.btn-undone:disabled` exception, phone tab bar with `env(safe-area-inset-bottom)` + 20×3 accent indicator, top tabs, `.only-*` visibility helpers across the D-04 breakpoints, `.crumb-link` hover idiom, shimmer skeleton, scroll-snap container, print and reduced-motion blocks. `outline: none` appears nowhere.
- lib/tokens.js: all 8 exports (`tokens`, `bp`, `pill`, `card`, `statusPill`, `GLYPHS`, `useMediaQuery`, `useViewport`), NO `'use client'` directive (server components import it directly), refined AA status colors (`#15703c`/`#b03d12`), `useViewport` calls both media hooks unconditionally, `getServerSnapshot` returns `false`. Node import test prints `IMPORT-OK`; `pill()` returns no background (ownership rule made concrete).
- scripts/check-viewports.mjs: parameterized sweep (`--port/--routes/--out/--no-cookie/--help`) driving system Chrome via playwright-core, injecting the `learnit_onboarded` cookie, asserting `scrollWidth − clientWidth ≤ 1` at 360/390/768/1024/1440, screenshotting each page. Live-verified against the dev server on port 3199: 15 pages captured, 6 pre-redesign overflows correctly REPORTED at 360/390 on `/`, `/onboarding`, `/nope`, exit 1 — exactly the plan's "done = the tool runs and produces verdicts" contract.
- Token completeness machine-checked: all 34 §7.2 colors match value-for-value in BOTH halves; spot checks pass (canvas `#f3f2f9`, ink `#12121a`, accent `#6c3ce9`, done-fg `#15703c`, space md 16, radius xl 20, pill 999).

## Task Commits

Not committed — commit skipped (commit_docs=false). All changes left uncommitted in the working tree per the orchestrator's sequential-execution instruction.

## Files Created/Modified
- `app/globals.css` — tokens (`:root`), reset (tokenized), interaction-state class layer, visibility helpers, skeleton, scroll-snap, print, reduced-motion (286 lines, min 120 required)
- `lib/tokens.js` — JS token mirror + `pill`/`card`/`statusPill` factories, `GLYPHS`, SSR-safe `useMediaQuery`/`useViewport` (directive-free, importable from server components)
- `scripts/check-viewports.mjs` — shared headless viewport verification tool (verification-only; never imported by app code)

## Decisions Made
- Class-owned `display` on `.tabbar`/`.topnav` (resting `flex`) so the plan's breakpoint hide rules cannot be defeated by inline styles — the same ownership rule the plan states for state pseudo-classes, applied to media visibility.
- Visibility helpers implemented hide-only (`display:none !important` per D-04 range) instead of show/hide value pairs: `display:initial` would turn divs inline (CSS initial value), and `!important` protects against inline `display` on helper-carrying elements — while the active range sets nothing so inline display works normally.
- `.btn-danger:hover` = `#f2dbd1` (danger-tint darkened 5%) per UI-SPEC §9.1's hover spec, which the plan's §9.1 reference implies.
- `statusPill()` unknown-status fallback to the muted `fetched` rung (prevents `tokens.status[undefined]` crashes in later plans).
- Ran the plan's verification verbatim on port 3199 (the research's proven scratch port; both 3199 and the assigned 3193 were free — no collision).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- The viewport tool reports 6 pre-redesign overflows (360/390 on `/`, `/onboarding`, `/nope`). This is expected and sanctioned by the plan's Task 3 `<done>`: "some pre-redesign screens may legitimately overflow at 360px today — the script's job is to REPORT; fixing happens in the per-screen plans." The assertion machinery demonstrably works (exit 1, `OVERFLOW` lines, `<n> failures` summary).
- Node emits a benign `MODULE_TYPELESS_PACKAGE_JSON` warning when the acceptance test imports lib/tokens.js directly (the package has no `"type": "module"`); Node auto-detects the ESM syntax and the import succeeds. No action taken — adding `"type": "module"` would modify package.json (outside files_modified) and change project module semantics.
- `npm install --no-save playwright-core` left both package.json AND package-lock.json untouched (verified by diff against a backup; nothing needed restoring).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- The Wave 1 contract every later plan consumes is in place: screens can style from `:root` vars (classes, media queries, print) and `lib/tokens.js` (inline styles), with the ownership rule documented at the top of the class layer.
- Ready for 02-02 (adaptive `/` + AppShell/TabBar), which consumes `.tabbar`/`.tabbar-item`/`.topnav` and `useViewport`; `.tab-item`, `.crumb-link`, `.skeleton`, `.only-*` land per-screen.
- Every downstream plan can run the same one-line check: dev server on its scratch port, then `node scripts/check-viewports.mjs --port <n> --routes <its routes>`.
- playwright-core currently sits in node_modules (no-save); later plans re-run `npm i --no-save playwright-core` if node_modules was pruned.
- Known pre-redesign overflow baseline (6 failures at 360/390 on `/`, `/onboarding`, `/nope`) — per-screen plans should drive this to zero; exit 1 today is the tool reporting, not a plan defect.

## Self-Check: PASSED

- Files exist: app/globals.css, lib/tokens.js, scripts/check-viewports.mjs (FOUND via `[ -f ]`)
- `npm run build` exits 0 (run after each task)
- Task 1 acceptance: `--color-` line count 63 (≥34), `btn-undone:disabled`, `env(safe-area-inset-bottom)`, `@media (min-width:768px)`, `.crumb-link`, dual `.on-dark` selector present; `outline: none` absent
- Task 2 acceptance: `IMPORT-OK` printed by the node import test; `useViewport` calls `useMediaQuery` 2× unconditionally; refined colors present; no `'use client'`
- Task 3 acceptance: `--help` exits 0; sweep prints OVERFLOW/failures with exit 1; screenshots for all 5 widths under /tmp/shots; `learnit_onboarded` in script; playwright-core NOT in package.json
- Commits: none expected (commit_docs=false)

---
*Phase: 02-ui-design-responsive-overhaul*
*Completed: 2026-08-15*
