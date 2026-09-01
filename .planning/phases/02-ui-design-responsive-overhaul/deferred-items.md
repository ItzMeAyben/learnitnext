# Phase 2 — Deferred Items (out-of-scope discoveries)

Executor log per gsd-executor SCOPE BOUNDARY: issues found during execution
that live in files the discovering plan may not edit. Owners are later plans
or the phase verifier.

## 1. TopNav horizontal overflow below 1024px (found during 02-04) — CLEARED by 02-08

- **Discovered:** 02-04 viewport sweep (`scripts/check-viewports.mjs --port 3196
  --routes /pathway/AI%20Agents,/pathway/AI%20Agents/print,/pathway/DoesNotExist`).
  414px overflow @360, 384px @390, 6px @768 on EVERY `(dashboard)` route
  (pathway and the 404 route overflow identically — shared chrome, not page
  content).
- **Culprit (isolated via DOM measurement):** `components/TopNav.js` — Phase 1
  inline-styled fixed row (tab cluster 464px + utilities cluster 160px =
  774px min width). With TopNav hidden, the pathway page's scrollWidth equals
  the viewport exactly at 360/390/768/1024/1440.
- **Owner:** plan 02-08 ("TabBar.js + PhoneHeader.js — the phone chrome") —
  `components/AppShell.js` explicitly documents "phone TabBar + slim phone
  header and responsive padding arrive in plan 02-08 — deliberately NOT added
  here." The phase-final full-route sweep in 02-12 re-checks this.
- **Action for 02-08:** collapse TopNav ≥768 only (`.topnav` class rules
  already exist in globals.css but TopNav.js has not adopted them), ship
  TabBar + PhoneHeader <768, and re-run the sweep on dashboard routes.
- **CLEARED 2026-08-15 (02-08):** TopNav adopted `.topnav` (display:none
  <768) + `.tab-item`; TabBar/PhoneHeader shipped. Sweep @3200: all
  `(dashboard)`-group routes (`/subjects`, `/subjects/[id]`, `/pathway/[id]`,
  `/quiz`, `/library`, `/pipeline`) clean at 360/390/768/1024/1440. The last
  remnant (7px @768, the Phase-1 logo row ≈751px min vs 704px available) was
  fixed by hiding the wordmark at tablet via the `.only-desktop` helper
  (mark-only logo 768–1023; full idiom ≥1024 untouched). Remaining overflow on
  `/` is page content, not chrome — see item 3.

## 2. `lib/tokens.js` cannot be imported by Server Components (plan-doc correction)

- **Discovered:** 02-04 Task 2 — `next build` fails with Turbopack: "You're
  importing a module that depends on `useSyncExternalStore` into a React
  Server Component module. This API is only available in Client Components."
  (React 19.2.8's react-server build does not export `useSyncExternalStore`;
  verified empirically 2026-08-15.)
- **Affected:** the 02-04 plan `<interfaces>` claim ("the print page … imports
  token VALUES from lib/tokens.js directly — that import only works because
  tokens.js has no 'use client' directive") is wrong, and the header comment in
  `lib/tokens.js` (lines 5-9) makes the same wrong claim.
- **Correct pattern (used by the print page):** server components consume
  tokens via the CSS-var half — `var(--color-*)`, `var(--space-*)`,
  `var(--radius-*)` — which globals.css mirrors 1:1 from `lib/tokens.js`.
- **Owner:** any plan that touches `lib/tokens.js` comments (or a docs pass).
  No code change needed; `app/not-found.js` (02-02 scope onward) should also
  use CSS vars, not a JS import, if it is ever a server component.

## 3. Page-content overflows that outlived the 02-08 shell fix (found during 02-08)

- **Discovered:** 02-08 sweep (port 3200, cookie fixture, DOM offender probe).
  The shared chrome now adds zero overflow (see item 1), but page CONTENT
  still blows out sub-1024 widths on three not-yet-overhauled screens:
  - `/` (Today, `components/Today.js`): 552px @360, 522px @390, 144px @768 —
    the header action-pill row and the 4-across fresh-material strip on phone,
    the 3-col grid + 320px right rail (Streak / NOW PLAYING) at 768.
  - `/listen`: 643px @360, 613px @390, 235px @768 (212px art tile / 330px
    quote card / 250px sidebar panes). `/session`: 270px @360, 240px @390.
  - `/onboarding`: 299px @360, 269px @390 (no-cookie sweep).
- **Owners:** `/` → 02-09 (§12 row-3 Today layouts); `/listen` + `/session`
  → 02-11 (§12 rows 8–9, also renders the TabBar in their phone chrome);
  `/onboarding` → 02-10. None of these files are editable by 02-08
  (files_modified fence).
- **Action:** each owning plan lands its §12 layout; 02-12 re-runs the
  full-route sweep in both cookie states as the phase gate.
