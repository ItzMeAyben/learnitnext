# Phase 2: UI Design & Responsive Overhaul - Research

**Researched:** 2026-08-15
**Domain:** Next.js 16.3.1 App Router UI architecture — cookie-adaptive routes, design tokens (CSS custom properties + JS mirror), responsive inline-style system without Tailwind, state/microcopy layer, headless visual verification
**Confidence:** HIGH (all framework claims verified against the bundled Next 16 docs in `node_modules/next/dist/docs/` or the shipped type definitions; verification protocol live-tested on this machine)

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
Copied verbatim from `.planning/phases/02-ui-design-responsive-overhaul/02-CONTEXT.md`:

**Landing & Entry (locked)**
- **D-01**: The landing page lives AT `/` and adapts: a visitor who has not
  completed onboarding sees the landing page; an onboarded user at `/` sees
  their dashboard (Today). No forced redirect between the two — the cold-start
  flash (Phase 1 review IN-06) is eliminated by rendering, not redirecting.
  Detection mechanism is the agent's discretion (cookie readable by the server
  component is the preferred research path; optimistic client render is the
  fallback). The OnboardingGate's redirect-to-/onboarding behavior is replaced
  by this adaptive landing: fresh visitors land ON the landing page at `/`,
  not bounced to the wizard.
- **D-02**: Landing page content tells the product story from the spec: the
  loop "save a link today → wake up to course material tomorrow", the four
  save doors (playlist / Telegram / browser / text), the overnight pipeline
  (fetch → sort → build), and what you get (study guides, briefing docs,
  quizzes, listen mode per subject). Primary CTA "Start setup" → `/onboarding`;
  it uses the app's own design system (one product, not a separate marketing
  skin) and shows real subject tiles as proof of what the app produces.

**Dashboard (locked)**
- **D-03**: Today is redesigned as a welcoming hub with clear hierarchy:
  (1) a greeting hero with a one-line overnight status, (2) ONE primary
  next action — "Continue where you left off" into the most recent subject's
  active pathway stage, (3) subjects grid, (4) quietly demoted secondary
  info (saved yesterday, pipeline health, streak as subtle reinforcement —
  not a wall of equally-weighted widgets). Learner name comes from a single
  source (end the Iven/Sam split).

**Responsive (locked)**
- **D-04**: Mobile-first, three breakpoints: phone (<768), tablet
  (768–1023), desktop (≥1024). Every screen — landing, onboarding, Today,
  subjects index/detail, pathway, quiz, listen, session, library, pipeline,
  404, print — is fully usable at 360px: no horizontal scroll, no clipped or
  overlapping content, touch targets ≥44px.
- **D-05**: Navigation adapts: TopNav collapses to a bottom tab bar on phone
  (app-like, always reachable by thumb); Listen's two panes stack; Library's
  table becomes stacked cards/rows on phone; Session's left rail becomes a
  bottom bar; pathway timeline scrolls vertically. Desktop layouts keep
  their current proportions.

**Visual System (locked)**
- **D-06**: Extract the app's existing visual language (colors, type scale,
  spacing, radii, shadows) into design tokens: CSS custom properties in
  `app/globals.css` plus a small `lib/tokens.js` helper for inline styles.
  NO new dependencies — no Tailwind, no component libraries; the app keeps
  its inline-style idiom, now token-driven. All screens adopt the tokens.
- **D-07**: One component vocabulary across screens: buttons/pills, cards,
  badges/status pills, table rows, nav items share identical idioms. Basic
  accessibility is table stakes: readable contrast, visible focus states,
  semantic buttons/links (the Phase 1 span→Link work stays).
- **D-08**: The 404 page and print view join the system (roadmap criterion 5).

**Welcoming UX Tone (locked)**
- **D-09**: Microcopy pass across every screen: friendly, plain, encouraging;
  empty states say what to do next ("Nothing saved yet — send your first
  link"), loading states use skeletons/spinners with personality instead of
  bare "Loading…", error states are calm and actionable ("Couldn't load —
  check the pipeline" + retry, already patterned in Phase 1's fixes).
- **D-10**: Onboarding keeps its five steps and Skip, but feels guided:
  progress indicator, no dead ends. It must not regress Phase 1's FLOW-02.
- **D-11**: All Phase 1 flow semantics are preserved: gate/flag behavior,
  subjects index, study loop with subject context, encoded hrefs, 404s
  (FLOW-01..06 must still pass at phase end — this is a regression fence).

### the agent's Discretion
- Adaptive-`/` detection mechanism (server cookie vs client render)
- Exact token values (extracted from existing screens; refine for contrast)
- Bottom tab bar icon set (text labels, existing glyphs, or inline SVGs)
- Landing page composition beyond D-02's required content
- Listen's light/dark toggle: keep local, unify into tokens, or retire
- Degree of micro-animation (subtle transitions fine; no motion system)
- Skeleton designs per screen
- Whether Session screen's layout survives as-is responsively or restacks

### Deferred Ideas (OUT OF SCOPE)
- Data realism for widgets (Phase 3: DATA-01..04)
- Capture actions (Phase 4: CAPT-01..03)
- Pipeline semantics (Phase 5: PIPE-01..02)
- Real integrations, audio playback, auth, scheduling (v2)
- Full dark mode across the app (Listen's toggle is the only dark surface today)

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| UI-01 | Landing page introduces the product and routes first-time visitors into onboarding and returning users into their dashboard | Adaptive-`/` architecture (Pattern 1): `app/page.js` server component reads the `learnit_onboarded` cookie via async `cookies()` and renders `<Landing/>` or `<Today/>`; cookie written by a Server Action from onboarding Finish/Skip (documented Next 16 pattern, see Code Examples) |
| UI-02 | Dashboard (Today) welcomes with a clear hero and a single obvious next action | UI-SPEC §14 hierarchy implemented on the existing `'use client'` Today page (rendered as a client child of the new server `app/page.js`); `LEARNER_NAME` exported from `lib/store.js` to end the Iven/Sam split (verified: `app/(dashboard)/page.js` hardcodes "Iven", `app/session/page.js` defines local `LEARNER_NAME = 'Sam'`) |
| UI-03 | Every screen usable from 360px through tablet to desktop — no horizontal scroll, no clipping | Token + class-layer system (Pattern 2/3): CSS custom properties in `app/globals.css`, JS mirror in `lib/tokens.js`, `useMediaQuery` hook for structural swaps only; grid `auto-fit/minmax` preferred for container-driven breakpoints; headless Chrome verification protocol (Pattern 5) live-tested at 360px |
| UI-04 | Onboarding and all empty/loading/error states use friendly guided copy — no redirect flash, no dead ends | D-01 adaptive render eliminates the OnboardingGate redirect (component retired); react-query `isLoading`/`isError` flags already in place on Library/Subjects/Pipeline (verified in source) drive skeletons/error cards per UI-SPEC §14.3 |
| UI-05 | One consistent visual system (type scale, spacing, color, component idioms) across every screen, including 404 and print | UI-SPEC §4–§10 token tables + §9 component vocabulary are the contract; both token halves (globals.css `:root` vars + `lib/tokens.js` factories) documented in Pattern 2; 404 (`app/not-found.js`, server component) and print (`app/pathway/[subjectId]/print/page.js`, server component) consume the same tokens; `@media print` rules live in the globals.css class layer |

</phase_requirements>

## Project Constraints (from AGENTS.md)

Extracted directives from `./AGENTS.md` (treated with the same authority as locked decisions):

1. **"This is NOT the Next.js you know"** — Next 16.3.1 has breaking changes vs training data; APIs, conventions, and file structure may differ.
2. **Read the bundled guides** in `node_modules/next/dist/docs/` before writing any code; heed deprecation notices. (This research did so; every framework claim below carries a doc citation. Executors MUST re-check bundled docs if they reach for any API not cited here.)
3. The AGENTS.md block is written/re-added by `next dev` — committing it with work keeps the tree clean (do not strip it from diffs).

Additional constraints from `.planning/config.json` / `STATE.md`:
- `commit_docs: false` — planning docs stay uncommitted unless the user asks.
- `workflow.nyquist_validation: false` — no Validation Architecture section (per phase brief).
- `ui_phase: true`, `ui_safety_gate: true` — the 02-UI-SPEC.md gate is active; plans implement THAT spec.

## Summary

Phase 2 is buildable with **zero new dependencies** on exactly the stack the project already runs (Next 16.3.1, React 19.2, JavaScript, inline styles). The four technical unknowns all resolve cleanly against the bundled Next 16 docs: (1) `cookies()` is async and read-only in Server Components — the adaptive `/` reads it in a server page, and onboarding writes it through a Server Action (`'use server'` file), which is the documented mutation path that also re-renders the tree so `/` reflects the new cookie without a manual refresh; (2) `/` must live in exactly ONE route file — the current `app/(dashboard)/page.js` must move to `app/page.js` (outside the route group) because two files resolving to `/` is a documented error, and a server page may conditionally render the `'use client'` Today page (documented composition); (3) inline styles cannot express pseudo-classes or media queries, so the UI-SPEC's small class layer in `globals.css` is not just sanctioned but the only mechanism — with one critical executor rule: a property set inline can never be overridden by a class's `:hover`/`:focus-visible` rule, so state-expressed properties must be owned exclusively by the class layer; (4) `var(--token)` inside inline `style` values is plain React/CSS pass-through and works everywhere, including SSR.

The verification protocol was live-tested on this machine (not theorized): dev server + system Chrome 151 `--headless=new --screenshot --window-size=360,800` produced a correct rendered screenshot of the app at 360px, viewable by the agent. Chrome's fresh-profile-per-run behavior models the "un-onboarded visitor" for free; the onboarded state (cookie injection) needs a ~20-line `playwright-core` script driving the same system Chrome (`channel: 'chrome'`, `--no-save` install leaves package.json untouched), which also gives the programmatic no-horizontal-scroll assertion (`scrollWidth <= innerWidth`) at 360/390/768/1024/1440.

**Primary recommendation:** Build the token layer (`globals.css` `:root` + class layer, `lib/tokens.js`) first, then the adaptive `/` (move `app/(dashboard)/page.js` → `app/page.js`, extract AppShell, add Server Action `completeOnboarding()`), then per-screen responsive passes top-down by UI-SPEC §12, verifying each screen at 360px with the headless Chrome sweep and at desktop for D-05 proportion preservation.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Adaptive `/` routing decision (onboarded?) | Frontend Server (SSR) — `app/page.js` reads cookie via `cookies()` | Browser (localStorage migration shim, one phase) | Cookie is the only client state the server can see; reading it during render makes `/` dynamic per request [CITED: cookies.md] |
| Writing the onboarded flag | API/Server tier — Server Action (`'use server'`) calls `cookies().set()` | Browser — `localStorage.setItem` kept one phase for compat; `document.cookie` is the fallback pattern | Server Components cannot set cookies (streaming); docs direct mutations to Server Functions / Route Handlers [CITED: cookies.md, 07-mutating-data.md] |
| Design tokens (colors/type/space/radii) | Browser — CSS custom properties on `:root` in `app/globals.css` | Frontend Server — `lib/tokens.js` JS mirror consumed by inline styles | CSS vars resolve at paint and work in inline style values; JS mirror keeps the inline-style idiom token-driven (D-06) |
| Interaction states (hover/focus-visible/active) | Browser — global class layer in `app/globals.css` | — | Inline styles cannot express pseudo-classes; classes are the only mechanism [VERIFIED: React style objects map to CSSOM properties only] |
| Structural responsive swaps (table→cards, pane stacking, bottom bar) | Browser — JS breakpoint hook (`useMediaQuery` in `lib/tokens.js`) + conditional render | Browser — CSS visibility helpers (`.only-phone` etc.) for show/hide | Media queries handle styling; DOM-shape changes need JS branching (UI-SPEC §2 rule) |
| Container-level responsiveness (grids) | Browser — CSS grid `auto-fit`/`minmax` via inline style + class layer | — | Preferred over JS per UI-SPEC §2; zero hydration cost |
| Safe-area / reduced-motion / print | Browser — CSS `env()`, `@media (prefers-reduced-motion)`, `@media print` in globals.css; `viewportFit: 'cover'` viewport export | Browser — `matchMedia` guard for JS `scrollIntoView` | Platform CSS features; `viewportFit` verified in shipped Viewport type [VERIFIED: extra-types.d.ts] |
| Microcopy / empty / loading / error states | Browser — client components keyed off react-query `isLoading`/`isError`/empty-data checks | — | Data-fetch state already lives client-side (Phase 1 pattern) |
| Visual verification | Dev tooling — headless Chrome / playwright-core on this machine | — | No test deps in package.json; protocol live-tested [VERIFIED] |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next (App Router) | 16.3.1 (installed, `package.json` `^16.3.1`) | Framework — pages/layouts/route groups, `cookies()`, Server Actions, viewport export | Already installed; D-06 forbids new deps; bundled docs are the authority [VERIFIED: package.json + node_modules/next/package.json] |
| react / react-dom | 19.2.8 | UI runtime; `useSyncExternalStore` for the media-query hook | Already installed [VERIFIED: package.json] |
| @tanstack/react-query | ^5.101.4 | Loading/error state flags driving skeletons/error cards (D-09) | Already installed and used on Today/Library/Subjects/Session [VERIFIED: source] |
| @tanstack/react-table | ^8.21.3 | Library table data logic — responsive restack changes presentation only (CONTEXT specifics) | Already installed; keep the table instance, swap the row renderer [VERIFIED: library/page.js] |

**No new runtime dependencies.** The design system is deliberately hand-built (D-06): tokens in `app/globals.css` + `lib/tokens.js`, icons as existing text glyphs + hand-written inline SVGs (UI-SPEC §1), fonts unchanged (see State of the Art).

### Supporting (verification-only, never shipped)

| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| Google Chrome (system) | 151.0.7922.138 installed | Headless screenshots at exact viewports (`--headless=new --screenshot --window-size`) | Every responsive task — PROVEN on this machine [VERIFIED: live run] |
| playwright-core | latest via `npm i --no-save` | Cookie injection (onboarded state), programmatic overflow assertion, full-page sweeps | When a check needs JS evaluation or cookie state; `channel: 'chrome'` drives the system Chrome, no browser download; `--no-save` leaves package.json untouched [CITED: docs 02-guides/testing/playwright.md sanctions Playwright for Next e2e] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS custom properties + inline styles (D-06) | Tailwind CSS v4, CSS Modules, vanilla-extract | All forbidden by D-06 ("NO new dependencies"); CSS Modules ARE bundled-docs-sanctioned for scoped CSS [CITED: 11-css.md] but the app's inline idiom plus one small global class layer needs no scoping machinery |
| Server Action cookie write | `document.cookie` client write; Route Handler `POST` | `document.cookie` works (and is the fallback), but the Server Action is the documented pattern and re-renders the tree with the new cookie in one roundtrip [CITED: 07-mutating-data.md "Cookies" section]; a Route Handler needs a `fetch` + manual navigation — more moving parts for the same result |
| System Chrome headless CLI | Full Playwright install (`npm init playwright`) | Full install adds config, test dirs, and packages — contradicts no-new-deps; `npx playwright` alone needs a browser build matching its version (cache holds chromium-1208; version match unverified [ASSUMED]) |
| next/font | Google Fonts `<link>` (status quo) | next/font is built-in (not a package.json dep) and self-hosts fonts [CITED: 13-fonts.md], but UI-SPEC §1 locks the font contract ("No webfont import is added") and mid-phase font-loading changes would alter rendering/verification baselines. Keep the existing `<link>`; revisit post-phase |

**Installation:**
```bash
# Runtime: nothing. Phase 2 adds ZERO packages.
# Verification only (leaves package.json untouched; safe to rm node_modules/playwright-core after):
npm install --no-save playwright-core
```

## Architecture Patterns

### System Architecture Diagram

```
                 Visitor hits GET /  (fresh profile: no cookie)
                        │
                        ▼
        ┌───────────────────────────────────┐
        │ app/layout.js  (root, server)     │  globals.css import (tokens+classes),
        │  html/body · Providers (RQ)       │  Google Fonts <link>, viewport export
        └───────────────┬───────────────────┘
                        ▼
        ┌───────────────────────────────────┐
        │ app/page.js  (SERVER, async)      │
        │  cookieStore = await cookies()    │   ← opts `/` into dynamic rendering
        │  onboarded = has('learnit_onboarded')
        └───────┬───────────────┬───────────┘
        no cookie│               │cookie=1
                ▼               ▼
     ┌────────────────┐   ┌─────────────────────────────┐
     │ <Landing/>     │   │ <AppShell>  (shared chrome) │
     │  own page bg,  │   │  TopNav (≥768) / phone      │
     │  no AppShell,  │   │  header + TabBar (<768)     │
     │  CTA →/onboard │   │  └─ <Today/> ('use client') │
     └───────┬────────┘   │     useQuery /api/*         │
             │            └──────────────┬──────────────┘
             │ Click "Start setup"        │
             ▼                            │
     ┌────────────────┐                   │
     │ /onboarding    │                   │
     │ ('use client') │                   │
     │ Finish/Skip ───┼─── onClick:       │
     └────────────────┘     │             │
                            ▼             │
        ┌───────────────────────────────┐ │
        │ app/actions.js  'use server'  │ │
        │  completeOnboarding():        │ │
        │   cookies().set(              │ │
        │     'learnit_onboarded','1')  │ │
        │   redirect('/')  ─────────────┼─┘ server re-renders `/`
        └───────────────────────────────┘   with cookie → <Today/>
                                          (no client cache staleness:
                                           dynamic pages always
                                           roundtrip [CITED: prefetching.md])

  Other routes unchanged in shape:
   (dashboard)/layout.js → AppShell(TopNav) → subjects | library | pipeline |
                           pathway | quiz        (deep links render normally,
   listen, session, onboarding: own full-page    no gate — UI-SPEC §13)
   chrome + TabBar on phone (per UI-SPEC §12 rows 8–9)
```

### Recommended Project Structure (deltas only)

```
app/
├── layout.js                  # + export const viewport { viewportFit:'cover' }; keep fonts <link>
├── page.js                    # NEW server component — adaptive /  (replaces (dashboard)/page.js)
├── actions.js                 # NEW 'use server' — completeOnboarding() sets cookie + redirect
├── globals.css                # 3-line reset → tokens :root + class layer + media/print (~150 lines)
├── (dashboard)/               # layout keeps AppShell for subjects/library/pipeline/pathway/quiz
│   ├── layout.js              # renders <AppShell>{children}</AppShell>
│   └── ... existing pages     # page.js at this level is DELETED (moved to app/page.js)
├── onboarding/page.js         # Finish/Skip call completeOnboarding (via form action or onClick)
├── listen/page.js             # + TabBar on phone; palette → tokens (UI-SPEC §7.5)
├── session/page.js            # + TabBar on phone (rail retires per UI-SPEC §12 row 9)
└── not-found.js               # tokens applied (D-08)
components/
├── AppShell.js                # NEW — canvas + 1440 column + TopNav/desktop + phone header (+TabBar)
├── TabBar.js                  # NEW 'use client' — fixed bottom bar <768px, self-hiding ≥768 via class
├── TopNav.js                  # tokenized; ≥768 only (hidden by class on phone)
└── OnboardingGate.js          # DELETED (D-01 — redirect replaced by adaptive render)
lib/
├── tokens.js                  # NEW — tokens mirror, pill()/card()/statusPill(), GLYPHS, useMediaQuery
└── store.js                   # + export const LEARNER_NAME = 'Iven'
```

### Pattern 1: Adaptive `/` — cookie-read server page + Server Action write

**What:** One route renders landing OR dashboard based on a server-readable cookie; the write happens in a Server Action; no redirect chain, no flash.
**When to use:** Exactly for D-01/UI-01. Also the blueprint for any future server-known preference.

Rules verified from the bundled docs:
- `cookies()` is **async** (`await cookies()`); reading works in Server Components; reading opts the route into dynamic rendering [CITED: cookies.md — "cookies is an async function... Using it in a layout or page will opt a route into dynamic rendering"].
- **Server Components cannot set cookies** — "Setting cookies is not supported during Server Component rendering. To modify cookies, invoke a Server Function from the client or use a Route Handler" [CITED: cookies.md]. HTTP can't set cookies after streaming starts.
- Server Action cookie writes are special: "When you set or delete a cookie in a Server Action, Next.js re-renders the current page and its layouts on the server so the UI reflects the new cookie value" [CITED: 07-mutating-data.md].
- A client page invokes a Server Function by importing it from a `'use server'` file and calling it from an event handler or `form action` [CITED: 07-mutating-data.md "Client Components" + "Event Handlers"].
- Route conflict rule: "Routes in different groups should not resolve to the same URL path... would both resolve to /about and cause an error" [CITED: route-groups.md] → `app/page.js` and `app/(dashboard)/page.js` cannot coexist. **The Today page file must move.**
- Server → Client composition is documented and unrestricted for this shape: a Server Component page renders Client Components and passes serializable props; Client Components cannot import Server Components but the dependency direction here is server→client, which is the standard pattern [CITED: 05-server-and-client-components.md "Passing data from Server to Client Components"].
- Dynamic pages are not held in the client router cache (Client Cache TTL "Off, unless enabled") — every navigation to `/` is a server roundtrip, so a freshly set cookie is reflected on the very next navigation with zero extra work [CITED: prefetching.md].

Landing-should-not-show-TopNav resolution: the landing must NOT live under `app/(dashboard)/layout.js`. Route groups don't affect the URL, so `app/page.js` (root level, outside the group) uses only the root layout — no TopNav, exactly what the landing needs; the onboarded branch wraps `<Today/>` in the extracted `<AppShell>` shared with the (dashboard) layout. Making the (dashboard) layout itself cookie-conditional is a dead end: layouts receive no pathname, and UI-SPEC §13 requires un-onboarded deep links (`/library`) to render normally WITH nav.

**Migration shim (discretion, recommended):** Phase 1 UAT users have only the localStorage flag. Without a shim they see the landing once and must click Start setup → Skip. A tiny client component on the landing (`localStorageMigrate`) can, on mount, check localStorage and — if set — write `document.cookie='learnit_onboarded=1; path=/; max-age=31536000'` then `router.refresh()` (documented API on `useRouter`). Server renders landing (no flash — it's the correct pre-shim state), refresh re-renders `/` as Today. Delete it in Phase 3.

### Pattern 2: The two-halves token system (globals.css + lib/tokens.js)

**What:** Every token exists twice — as a `:root` CSS custom property (for the class layer, media queries, print, and anything CSS must compute) and as a JS constant (for inline styles). UI-SPEC §2 mandates this.
**When to use:** All styling in the phase.

Mechanics verified:
- `style={{ background: 'var(--color-surface)' }}` is plain React → CSSOM pass-through; `var()` in the *value* position resolves at paint. Works with SSR (the string is serialized verbatim into the style attribute). `var()` cannot be used in the *property-name* position [VERIFIED: standard CSS/React behavior; no Next involvement — 11-css.md treats global CSS as ordinary CSS].
- Global CSS is imported in a layout and applies to every route in its subtree; the app already does this (`app/layout.js` imports `./globals.css`) [CITED: 11-css.md "Global CSS"]. No constraints on class names beyond ordinary CSS; the docs' only warning is that global styles are not removed on navigation — irrelevant for an app-wide vocabulary intended to persist [CITED: 11-css.md "Good to know"].
- CSS Modules (`.module.css`) are available without any config if per-component scoping is ever wanted [CITED: 11-css.md "CSS Modules"] — not needed for this phase.

**The one executor rule that makes the hybrid work (critical):** an inline `style` declaration has higher specificity than any class rule. `.btn-primary:hover { background: #26263a }` will do **nothing** if the element also sets `background` inline. Therefore, for any element with class-based states, the properties those states touch (typically `background`, `color`, `opacity`, `transform`, `outline`) must be owned **exclusively** by the class; inline styles on that element handle only layout (padding, grid, gap, width). `lib/tokens.js` factories (`pill()`, `card()`) should therefore return state-free layout/style objects, with variants as class names (`className="btn btn-primary"`). This resolves the UI-SPEC §2 rule into a concrete division of ownership.

### Pattern 3: Responsive strategy ladder (CSS-first, JS last)

Ordered by preference (matches UI-SPEC §2 "Container-driven responsiveness is preferred over JS breakpoints"):

1. **Fluid inline styles** — `maxWidth`, `minWidth: 0` on flex children (the #1 cause of 360px blowouts today: fixed-width flex children like Listen's 212px art tile / 330px quote card / 250px sidebar need `flex: none` → restack or `minWidth: 0`), percentages, `clamp()` for type.
2. **Container-driven grids** — `display: grid; gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))'` inline (subjects grid, material cards) collapses 3→2→1 with zero media queries.
3. **Class-layer media queries** — `.only-phone` / `.only-tablet` / `.only-desktop` display helpers, the `.tabbar` (fixed, `@media (min-width: 768px) { display: none }`), `.table-row` desktop grid vs phone stack. Breakpoints: `<768` phone, `768–1023` tablet, `≥1024` desktop (D-04).
4. **JS structural swap** — only when the DOM shape changes: Library table→stacked cards, Listen pane stacking, Session rail→global TabBar, pathway reorder arrows→Move up/down row. Use `useMediaQuery('(max-width: 767px)')` from `lib/tokens.js` (implementation below). SSR-safe pattern: `useSyncExternalStore(subscribe, () => matchMedia(q).matches, () => false)` — `getServerSnapshot` and the first client render must agree (both `false` = desktop shell) to avoid hydration mismatch, then the effect-corrected render swaps in the phone layout on hydration. One frame of desktop layout on phones is the accepted cost of SSR correctness; mitigate by keeping phone/desktop variants of the *same* component where possible (CSS ladder rungs 1–3) and reserving the JS swap for genuinely different trees.
5. **Scroll containers, never page scroll** — the ONE sanctioned horizontal scroll is the landing proof-tile carousel (`overflow-x: auto; scroll-snap-type: x mandatory` inline + `scroll-snap-align: start` on children).

### Pattern 4: Bottom Tab Bar placement (DOM order + fixed positioning)

`TabBar` is `position: fixed; bottom: 0` so visual placement is independent of tree position — but **tab order is not**: UI-SPEC §11 requires the bar LAST in DOM (after `main`) so keyboard order reads content→nav. Render `<TabBar/>` as the last child of each screen-level wrapper: inside `AppShell` (covers `/` onboarded + all `(dashboard)` routes), and explicitly in `listen/page.js` and `session/page.js` phone layouts (both live outside the group with their own chrome — UI-SPEC §12 rows 8–9 make the global bar cover their phone navigation). Landing and onboarding do not render it. `TabBar` hides itself `≥768px` via a class rule (`display: none`), keeps `aria-current="page"` via `usePathname`, and pads with `calc(56px + env(safe-area-inset-bottom))`.

### Pattern 5: Headless responsive verification (live-tested)

**What:** Zero-dependency visual verification at the five acceptance widths against the dev server.
**When to use:** Every responsive task's verification step; final sweep for UI-03.

Protocol (PROVEN on this machine 2026-08-15):

```bash
# 1. Dev server on a scratch port
npm run dev -- --port 3199 &

# 2. Screenshot sweep — un-onboarded state comes free (fresh profile per run)
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
for W in 360 390 768 1024 1440; do
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars \
    --window-size=${W},900 --virtual-time-budget=8000 \
    --screenshot=/tmp/learnit-${W}.png http://localhost:3199/ 2>/dev/null
done
```

- `--window-size` IS the viewport in headless screenshot mode → exact-width captures.
- `--virtual-time-budget=8000` fast-forwards timers so react-query fetches settle before capture (observed rendering complete app UI [VERIFIED]; keep 8s, raise if a screen still shows skeleton).
- Fresh profile per run = no cookies, no localStorage → models the un-onboarded visitor; the current OnboardingGate even redirected the capture to `/onboarding` (live confirmation of the IN-06 flash D-01 removes).
- Reduced-motion capture: add `--force-prefers-reduced-motion` [ASSUMED: Chrome flag, stable for years].

For the **onboarded state and the programmatic overflow assertion**, use the playwright-core script (below, Code Examples) — it injects the cookie, drives the same system Chrome, and asserts `document.documentElement.scrollWidth <= window.innerWidth` per viewport per route. `--no-save` keeps package.json clean; `channel: 'chrome'` means no browser download.

### Anti-Patterns to Avoid

- **Inline style + class fighting over the same property** — the hover/focus class silently loses (see Pattern 2's ownership rule). Detect: any interactive element with a `.btn-*`/`.tab-*` class that also sets `background` inline.
- **Two page files resolving to `/`** — `app/page.js` + `app/(dashboard)/page.js` = documented build error [CITED: route-groups.md "Conflicting paths"]. Move, don't add.
- **`cookies().set()` inside a Server Component** (e.g., trying to write the flag from `app/page.js`) — unsupported; streaming has started [CITED: cookies.md].
- **Reading `cookies()` synchronously** — v15+ async API; the compat sync access is deprecated [CITED: cookies.md "Good to know"].
- **Media-query JS branching for things CSS can do** — every JS breakpoint is a hydration seam and a re-render; grids and display helpers first.
- **Fixed pixel widths on flex children** — Listen's 212/330px panes, Today's 336px rail, Pipeline's 400px log: on phone these are the horizontal-scroll bugs UI-03 bans. Restack or `minWidth: 0`.
- **Removing the `<Link>`s while restyling** — D-11/FLOW-05: Phase 1 converted spans to Links; the redesign must carry them over (same for `encodeURIComponent` hrefs).
- **`outline: none`** anywhere — banned by UI-SPEC §10; the global `:focus-visible` ring is non-negotiable.
- **Hydrating a media-query hook from `window`** — `getServerSnapshot` must return the same value the server rendered or React logs hydration mismatch; seed `false`, correct after mount (Pattern 3 rung 4).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Server-known onboarding state | localStorage sniffing in a layout effect + redirect (current gate — causes the IN-06 flash) | Cookie read via `await cookies()` in the server page + Server Action write | Render-time decision has no flash; documented pattern [CITED: cookies.md, 07-mutating-data.md] |
| Viewport meta / theme-color | Hand-written `<meta name="viewport">` in `<head>` | `export const viewport` from `app/layout.js` | Manual head tags are discouraged; the Metadata/Viewport APIs handle streaming + dedup [CITED: generate-viewport.md, layout.md] |
| Breakpoint hook | `resize` listener + setState (re-renders on every pixel) | `useSyncExternalStore` + `matchMedia` (Pattern 3) | Subscribes to the query, not every pixel; SSR-safe with `getServerSnapshot` [CITED: React 19 `useSyncExternalStore` contract] |
| Responsive table | Replacing @tanstack/react-table with hand-rolled sort/filter | Keep the table instance; swap row presentation (cards <768) | Sorting/filtering logic already works and is tested by Phase 1 flows; only presentation changes (CONTEXT specifics) |
| Focus/hover/active states | onMouseEnter/onClick state swaps on every interactive element | Class layer `:hover`/`:focus-visible`/`:active` rules | Pseudo-classes are impossible inline; JS state swaps bloat every component and miss keyboard focus |
| E2E scaffolding | Full Playwright project (`npm init playwright`) for five screenshots | System Chrome headless CLI + optional playwright-core script | No config, no test dirs, no deps in package.json; docs sanction Playwright but the phase needs captures, not a test suite [CITED: testing/playwright.md, understood as the heavyweight path] |
| Safe-area / reduced-motion detection | UA sniffing for iPhone / motion preference | `env(safe-area-inset-*)` in CSS, `@media (prefers-reduced-motion: reduce)` + `matchMedia` for JS | Platform CSS features; UA sniffing breaks on every new device |

**Key insight:** every hand-roll candidate above re-implements something the framework, the platform, or an already-installed library does natively — and each one is a place where the D-11 regression fence gets broken (redirects reintroduce flashes, JS state swaps lose keyboard semantics, table rewrites lose sort/filter).

## Common Pitfalls

### Pitfall 1: Inline style specificity silently kills class-based hover/focus
**What goes wrong:** `.btn-primary:hover { background: var(--color-ink-soft) }` never fires because the element sets `background` inline (inline wins the cascade).
**Why it happens:** The app's idiom is inline-everything; executors naturally keep setting colors inline while adding state classes.
**How to avoid:** Pattern 2's ownership rule — state-touched properties belong ONLY to the class layer; `pill(variant)` factories return layout-only objects + a variant class name.
**Warning signs:** Hover/focus does nothing in dev; UI review dimension 3 fails on focus ring (outline set inline would block `.on-dark` lime ring swap the same way).

### Pitfall 2: Duplicate `/` route — build error at the worst time
**What goes wrong:** Adding `app/page.js` while `app/(dashboard)/page.js` still exists → "Conflicting paths" error [CITED: route-groups.md]; or worse, deleting the old file but forgetting its `(dashboard)` siblings now render under AppShell without Today.
**Why it happens:** Route groups hide the collision until build/dev resolution.
**How to avoid:** One task moves `app/(dashboard)/page.js` → `app/page.js` and rewrites it as the async server component in the same commit.
**Warning signs:** Next dev error page mentioning duplicate routes.

### Pitfall 3: Cookie write from the wrong place
**What goes wrong:** Calling `cookieStore.set()` during Server Component render throws / is ignored ("HTTP does not allow setting cookies after streaming starts") [CITED: cookies.md]; or writing `document.cookie` and immediately `router.push('/')` in the same tick can race the navigation.
**Why it happens:** The read path (server page) and write path (client onboarding) are different files; intuition says "just set it where you read it."
**How to avoid:** `app/actions.js` `'use server'` file; Finish/Skip call `completeOnboarding()` which sets the cookie and `redirect('/')`. The action's roundtrip re-renders `/` server-side with the new cookie [CITED: 07-mutating-data.md]. Keep the localStorage write in the client handler for one-phase compat (UI-SPEC §13).
**Warning signs:** Landing still shows after Finish; cookie present in devtools only after a manual refresh.

### Pitfall 4: `await`-less or `metadata.viewport`-era API usage
**What goes wrong:** `const store = cookies()` (sync) — deprecated/throws in 16 [CITED: cookies.md version history]; `export const metadata = { viewport: {...} }` — superseded since v14 by the separate `viewport` export; `themeColor` inside `metadata` — moved to `viewport`.
**Why it happens:** Training data is 6–18 months stale (AGENTS.md exists precisely for this).
**How to avoid:** Use the exact snippets in Code Examples; the bundled docs are in `node_modules/next/dist/docs/` — executors re-check any API not cited in this research.
**Warning signs:** Dev-mode deprecation notices; missing `<meta name="viewport">` output.

### Pitfall 5: Hydration mismatch from media-query hooks
**What goes wrong:** `useState(window.matchMedia(...).matches)` renders phone DOM on the client while the server rendered desktop DOM → hydration errors, flicker, sometimes full client re-render.
**Why it happens:** Server has no viewport.
**How to avoid:** `useSyncExternalStore` with `getServerSnapshot={() => false}` and initial client snapshot agreeing (Pattern 3 rung 4); prefer CSS ladder rungs 1–3 so most screens never need the hook.
**Warning signs:** Console "Hydration failed" / "server rendered HTML didn't match"; layout pops after load on phone.

### Pitfall 6: Safe-area insets read zero
**What goes wrong:** `env(safe-area-inset-bottom)` is 0 on notched iPhones unless the viewport extends into the notch area — the default `viewport-fit=auto` letterboxes, so the tab bar padding vanishes exactly on the devices that need it.
**Why it happens:** Platform behavior: insets only populate with `viewport-fit=cover`.
**How to avoid:** `export const viewport = { viewportFit: 'cover' }` in `app/layout.js` [VERIFIED: field exists in shipped Viewport type — `node_modules/next/dist/lib/metadata/types/extra-types.d.ts` line 52 — though absent from the markdown docs]. Keep Next's default width/initialScale (auto-set; "manual configuration is usually unnecessary" [CITED: generate-viewport.md]).
**Warning signs:** Tab bar hidden by the home indicator on iPhone; can't verify headlessly (no notch) — flag for human UAT.

### Pitfall 7: FLOW regression while restyling (D-11 fence)
**What goes wrong:** Redesign drops a Phase 1 wire: span-ification of buttons, losing `encodeURIComponent` on rebuilt hrefs, quiz/listen exits pointing at the wrong subject, hardcoded `/subjects/AI Agents` resurfacing in new copy, OnboardingGate removal accidentally changing FLOW-02 wizard semantics.
**Why it happens:** Screens get rewritten, not just restyled; details live in old JSX.
**How to avoid:** The FLOW-01..06 matrix from `.planning/phases/01-connect-screens/01-VERIFICATION.md` re-runs at phase end (UI-SPEC §15 amends FLOW-01: landing CTA satisfies "routed into onboarding"); encoded-href check is `grep -r "subjects/"` for raw template literals without `encodeURIComponent`.
**Warning signs:** Any new `onClick` navigation span; any `href={'/subjects/' + id}` without encoding.

### Pitfall 8: Screenshot verification lies about the onboarded state
**What goes wrong:** Chrome headless CLI starts cookieless every run — every capture shows the landing/onboarding even after the dashboard is "done," or conversely a stale manual cookie makes an executor think the adaptive route is broken.
**Why it happens:** Fresh profile per `--screenshot` run.
**How to avoid:** Treat CLI captures as the un-onboarded fixture (a feature: it's the D-01 cold-start test); use the playwright-core script with `context.addCookies([{ name: 'learnit_onboarded', value: '1', url: 'http://localhost:3199' }])` for the Today fixture.
**Warning signs:** `/` screenshot never shows Today no matter what you click.

### Pitfall 9: Font baseline shifts mid-phase
**What goes wrong:** Removing the Google Fonts `<link>` (UI-SPEC §1 language "renders Plus Jakarta Sans when locally installed, else system-ui") changes metrics on machines without the font — line wraps, skeleton sizes, and verification screenshots all shift; adding `next/font` mid-phase changes loading behavior.
**Why it happens:** UI-SPEC §1's "No webfont import is ADDED" is ambiguous about the EXISTING link.
**How to avoid (resolution):** Keep the existing `<link>` in `app/layout.js` unchanged this phase — it predates Phase 2, is not a new dependency, and guarantees deterministic rendering across dev/verify machines. Fonts stay named in tokens exactly as UI-SPEC prescribes. Any next/font migration is a post-phase optimization.
**Warning signs:** Captures differ between machines with/without PJS installed.

## Code Examples

All examples JavaScript (no TS in project). Sources cited per block.

### Adaptive `/` (app/page.js) — server component
```jsx
// Source: node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cookies.md
//         + 01-getting-started/05-server-and-client-components.md (server renders client children)
import { cookies } from 'next/headers'
import Landing from '../components/Landing.js'
import AppShell from '../components/AppShell.js'
import Today from '../components/Today.js'

export default async function AdaptiveHome() {
  const cookieStore = await cookies()           // async in 15+ — must await
  const onboarded = cookieStore.has('learnit_onboarded')

  if (!onboarded) return <Landing />            // no dashboard chrome
  return (
    <AppShell>
      <Today />                                  // 'use client' child — allowed
    </AppShell>
  )
}
```

### Cookie write via Server Action (app/actions.js)
```js
// Source: node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md ("Cookies", "Client Components")
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function completeOnboarding() {
  const cookieStore = await cookies()
  cookieStore.set('learnit_onboarded', '1', {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,   // 1 year; sameSite 'lax' is a sane default
    // NOT httpOnly: keeps the optional client migration shim possible
  })
  redirect('/')   // server re-renders '/' — action already re-renders the tree
}                 // with the new cookie [CITED: 07-mutating-data.md]
```
```jsx
// onboarding/page.js ('use client') — Finish/Skip buttons:
import { completeOnboarding } from '../actions.js'

async function finish() {
  try { localStorage.setItem('learnit_onboarded', '1') } catch {}  // compat, one phase
  await completeOnboarding()                                       // cookie + redirect
}
// <button onClick={finish}>Finish setup</button>  (or <form action={completeOnboarding}>)
```

### Viewport export (app/layout.js)
```js
// Source: node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-viewport.md
//         viewportFit verified in node_modules/next/dist/lib/metadata/types/extra-types.d.ts
/** @type {import('next').Viewport} */
export const viewport = {
  viewportFit: 'cover',        // activates env(safe-area-inset-*) on notched devices
  // width/initialScale intentionally omitted — Next auto-sets width=device-width, initial-scale=1
  themeColor: '#f3f2f9',       // matches canvas token (optional polish)
}
```

### globals.css skeleton (shape only — values from UI-SPEC §4–§7, §10)
```css
/* Source pattern: 01-getting-started/11-css.md (Global CSS, imported in root layout) */
* { box-sizing: border-box }
body { margin: 0; background: var(--color-canvas-deep); font-family: var(--font-sans); color: var(--color-ink) }
a { color: inherit; text-decoration: none }

:root {
  --color-canvas: #f3f2f9;  --color-surface: #ffffff;  --color-ink: #12121a;
  --color-accent: #6c3ce9;  /* ... every §7.2 token ... */
  --space-md: 16px;         /* ... every §4 token ... */
  --radius-pill: 999px;     /* ... every §5 token ... */
  --font-sans: 'Plus Jakarta Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
}

/* Class layer — the ONLY place pseudo-classes/media queries can live (UI-SPEC §2, §10) */
:where(a, button, input, select, [tabindex]):focus-visible {
  outline: 2px solid var(--color-accent); outline-offset: 2px;
}
.on-dark :focus-visible { outline-color: var(--color-lime); }

.btn { border: 0; border-radius: var(--radius-pill); min-height: 44px;
       font-weight: 700; font-size: 14px; cursor: pointer;
       transition: background 150ms ease, transform 100ms ease; }
.btn:active { transform: scale(.98); }
.btn-primary { background: var(--color-ink); color: #fff; padding: 12px 24px; }
.btn-primary:hover { background: #26263a; }        /* wins ONLY if background is NOT set inline */

.tabbar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 40;
          height: calc(56px + env(safe-area-inset-bottom));
          padding-bottom: env(safe-area-inset-bottom);
          background: var(--color-surface); box-shadow: 0 -2px 12px rgba(18,18,26,.08); }
@media (min-width: 768px) { .tabbar { display: none } }

.only-phone { display: initial }  .only-desktop { display: none }
@media (min-width: 768px) { .only-phone { display: none }  .only-desktop { display: initial } }

@keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
.skeleton { background: linear-gradient(90deg, var(--color-surface-sunken) 25%, rgba(255,255,255,.55) 50%, var(--color-surface-sunken) 75%); background-size: 200% 100%; border-radius: var(--radius-md); animation: shimmer 1500ms ease-in-out infinite; }

@media (prefers-reduced-motion: reduce) {
  .skeleton { animation: none }
  * { transition-duration: 0.01ms !important }
}
@media print { .no-print { display: none } /* print view rules, UI-SPEC §12 row 13 */ }
```

### lib/tokens.js — media hook + inline var() usage
```js
// Source: React 19 useSyncExternalStore (react.dev) — SSR-safe breakpoint hook
'use client'
import { useSyncExternalStore } from 'react'

export const bp = { phone: 768, tablet: 1024 }

export function useMediaQuery(query) {
  const subscribe = (cb) => {
    const mql = window.matchMedia(query)
    mql.addEventListener('change', cb)
    return () => mql.removeEventListener('change', cb)
  }
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,          // server snapshot MUST match initial client render
  )
}
export const useViewport = () =>
  useMediaQuery(`(min-width: ${bp.tablet}px)`) ? 'desktop'
  : useMediaQuery(`(min-width: ${bp.phone}px)`) ? 'tablet' : 'phone'

// Inline var() usage — value position only; property stays camelCase:
// <div style={{ background: 'var(--color-surface)', padding: 'var(--space-lg)',
//               borderRadius: 'var(--radius-xl)' }}>
```

### playwright-core verification script (throwaway, e.g. /tmp/check.mjs)
```js
// Source: docs 02-guides/testing/playwright.md (Playwright is the sanctioned Next e2e tool);
// channel:'chrome' drives the system Chrome — no browser download.
// Run:  npm install --no-save playwright-core && node /tmp/check.mjs
import { chromium } from 'playwright-core'

const ROUTES = ['/', '/subjects', '/library', '/pipeline', '/listen', '/session',
                '/subjects/AI%20Agents', '/pathway/AI%20Agents', '/quiz?subject=AI%20Agents',
                '/onboarding', '/nope']
const WIDTHS = [360, 390, 768, 1024, 1440]

const browser = await chromium.launch({ channel: 'chrome', headless: true })
let failures = 0
for (const route of ROUTES) {
  for (const width of WIDTHS) {
    const ctx = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: 'reduce',                      // also exercises the media query
    })
    await ctx.addCookies([{ name: 'learnit_onboarded', value: '1',
                            url: 'http://localhost:3199' }])
    const page = await ctx.newPage()
    await page.goto(`http://localhost:3199${route}`, { waitUntil: 'networkidle' })
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth)
    if (overflow > 1) { failures++; console.log(`OVERFLOW ${overflow}px  ${width}w  ${route}`) }
    await page.screenshot({ path: `/tmp/shots/${width}-${route.replaceAll('/', '_')}.png` })
    await ctx.close()
  }
}
await browser.close()
console.log(failures === 0 ? 'ALL VIEWPORTS CLEAN' : `${failures} failures`)
```

## State of the Art

| Old Approach | Current Approach (Next 16.3.1) | When Changed | Impact |
|--------------|-------------------------------|--------------|--------|
| `cookies()` synchronous | `await cookies()` — async; sync access deprecated | v15.0.0 [CITED: cookies.md version history] | Every read in the new `app/page.js` must await |
| Set cookies anywhere in server render | Set ONLY in Server Functions / Route Handlers ("HTTP does not allow setting cookies after streaming starts") | Documented position in 16 | Onboarding write goes through `app/actions.js` |
| `metadata = { viewport: {...} }` | Separate `export const viewport` (Server Components only) | v14.0.0 [CITED: generate-viewport.md] | `viewportFit: 'cover'` lands in `app/layout.js` viewport export; never in a `'use client'` file |
| Manual `<meta viewport>` in `<head>` | Auto-set by Next ("manual configuration is usually unnecessary") | Current | Only add viewport export for `viewportFit`/`themeColor` |
| Pages-router `_app` global CSS | Global CSS imported in any layout/page in `app/` | v13+ | Existing `globals.css` import already correct |
| localStorage-only gate + `router.replace` | Cookie + server-rendered adaptive route + Server Action | This phase (D-01) | Kills IN-06 flash; OnboardingGate retired |
| `onMouseEnter` state swaps for hover | CSS class layer (`:hover`, `:focus-visible`) | Platform constant | Only mechanism compatible with inline-style idiom |
| Full Playwright install for e2e | Chrome headless CLI + `playwright-core --no-save` for one-off capture | Ecosystem | Zero committed deps; protocol proven live |

**Deprecated/outdated to watch for in generated code:** sync `cookies()`, `metadata.viewport`, `themeColor` inside `metadata`, `useRouter().events` (not needed here), `@media` tricks inside inline styles (impossible — class layer only).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Cached playwright browser build (chromium-1208 in `~/Library/Caches/ms-playwright`) matches some `npx playwright` version, avoiding a browser download | Environment Availability | Low — recommendation uses `channel: 'chrome'` (system Chrome) precisely to avoid depending on this |
| A2 | `--virtual-time-budget=8000` always settles react-query fetches in headless captures | Pattern 5 | Low — one screen may capture mid-skeleton; raise budget or switch that route to the playwright script (`waitUntil: 'networkidle'`) |
| A3 | `env(safe-area-inset-*)` returns 0 without `viewport-fit=cover` on notched iOS; insets are non-zero only there | Pitfall 6 | Low — standard platform behavior (MDN); worst case the tab bar gets extra harmless padding |
| A4 | Cookie attrs recommendation (`path:/`, `maxAge 1y`, lax, non-httpOnly) is appropriate for this non-sensitive flag | Code Examples | Trivial — a personal onboarding flag; no auth consequence |
| A5 | Chrome flag `--force-prefers-reduced-motion` exists in current Chrome | Pattern 5 | Trivial — reduced-motion verification can instead use playwright-core's `reducedMotion: 'reduce'` (already in the script) |

All other claims are `[CITED]` (bundled Next 16 docs / shipped type defs) or `[VERIFIED]` (live run on this machine / direct source read).

## Open Questions

None blocking. The two judgment calls surfaced during research were resolved inline:
1. **Existing Google Fonts `<link>` vs UI-SPEC "no webfont import"** — resolved: keep the link (Pitfall 9). It is pre-existing, not a new dependency, and keeps rendering deterministic across machines; fonts remain named in tokens per UI-SPEC §1.
2. **Where the phone TabBar lives given Listen/Session sit outside the (dashboard) group** — resolved: `TabBar` is a self-contained fixed-position client component rendered as the last child of each screen wrapper (AppShell, listen, session), never in the root layout (landing/onboarding must not show it, and a root-level client bar cannot know the server-side onboarded state without a flash). See Pattern 4.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | dev server | ✓ | v24.0.0 | — |
| npm | playwright-core --no-save | ✓ | 11.3.0 | — |
| Google Chrome (system) | headless screenshots, playwright `channel:'chrome'` | ✓ | 151.0.7922.138 | playwright cached chromium-1208 (version-match unverified) |
| Next dev server | all verification | ✓ PROVEN (ran on :3199, routes returned 200) | 16.3.1 | — |
| playwright-core | cookie-state + overflow assertions | ✗ (not installed) | — via `npm i --no-save` | Chrome CLI screenshots (un-onboarded state only) |
| Playwright browsers cache | alternate browser source | ✓ chromium-1208 cached | match uncertain [ASSUMED A1] | system Chrome |

**Missing dependencies with no fallback:** none.
**Missing dependencies with fallback:** playwright-core (fallback: Chrome headless CLI covers un-onboarded visual checks; cookie-state checks need the script).

## Security Domain

Lean review — this phase adds no authentication, no data input beyond an onboarding flag, and no new network surface.

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Personal single-user tool; no auth this phase (unchanged) |
| V3 Session Management | no | The `learnit_onboarded` cookie is a UI preference flag, not a session credential |
| V4 Access Control | no | All routes remain public by design; no privileged surface added |
| V5 Input Validation | no | No new user input; onboarding token field remains mock (Phase 4 concern) |
| V6 Cryptography | no | Nothing to protect |

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Server Action reachable via direct POST (framework warning: "Server Functions are reachable via direct POST requests") [CITED: 07-mutating-data.md WARNING] | Elevation/Tampering | `completeOnboarding()` sets a non-sensitive preference cookie only — worst case a visitor "completes onboarding" for themselves. No auth checks needed; add them if actions ever touch data |
| Cookie tampering | Tampering | Flag value `'1'` only gates landing-vs-dashboard render; no security decision derives from it |
| XSS via landing copy | Tampering | All copy is static JSX (auto-escaped); no `dangerouslySetInnerHTML` anywhere (verified: grep clean); keep it that way |
| localStorage flag | — | Kept one phase for compat only; never trusted for anything beyond the migration shim |

## Sources

### Primary (HIGH confidence)
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cookies.md` — async API, read-in-server/set-in-actions rules, options, version history
- `node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md` — Server Functions, `'use server'` files, client invocation, cookie-set re-render behavior, security warning
- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md` — server→client composition, serializable props
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route-groups.md` — conflicting-paths error (two files at `/`)
- `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md` — layouts/pages/route nesting
- `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md` — Global CSS, CSS Modules, ordering, no class-name constraints
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-viewport.md` — viewport export, auto-set meta, Server-Components-only
- `node_modules/next/dist/lib/metadata/types/extra-types.d.ts` (line 52) — `viewportFit: 'auto'|'cover'|'contain'` in shipped Viewport type
- `node_modules/next/dist/docs/01-app/02-guides/prefetching.md` — dynamic pages: client cache TTL off, server roundtrip on click
- `node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md` — next/font optional, built-in, self-hosting
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/layout.md` — don't hand-write head/meta tags; Metadata API
- `node_modules/next/dist/docs/01-app/02-guides/testing/playwright.md` — Playwright as sanctioned Next e2e tool
- Phase contract: `.planning/phases/02-ui-design-responsive-overhaul/02-UI-SPEC.md` (the design contract plans implement) and `02-CONTEXT.md` (D-01..D-11)

### Secondary (MEDIUM confidence)
- Live verification on this machine 2026-08-15: dev server on :3199 (200s on `/`, `/subjects`), headless Chrome 151 screenshot at 360×800 rendered and inspected — protocol proven
- Direct source reads: all 14 screens, `lib/store.js`, `lib/wave.js`, `app/providers.js`, `components/*` — facts cited inline (Iven/Sam split, STATUS_PILL duplication, Listen palette object, fixed-width panes, print page is a server component, Library GRID_COLUMNS string)

### Tertiary (LOW confidence)
- MDN platform claims: `env(safe-area-inset-*)` requires `viewport-fit=cover` (standard, widely documented); React `useSyncExternalStore` contract (react.dev — stable since React 18)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zero-dep stack is the installed stack; every framework claim doc-cited
- Architecture: HIGH — adaptive-`/` shape follows documented composition, conflict, and mutation rules; route-group analysis is from the bundled file-convention docs
- Pitfalls: HIGH — top 2 pitfalls (inline-vs-class specificity, duplicate `/` route) derive directly from cited doc rules + codebase facts; verification protocol live-tested

**Research date:** 2026-08-15
**Valid until:** 2026-09-14 (stable stack, pinned local Next version; bundled docs are immutable in node_modules)
