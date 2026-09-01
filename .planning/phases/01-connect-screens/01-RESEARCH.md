# Phase 1: Connect the Screens (App Flow) - Research

**Researched:** 2026-08-14
**Domain:** Next.js 16 App Router navigation/flow wiring (client + server), not-found handling, first-run gating
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### Flow & Entry (locked)
- **D-01**: First-time visitors are routed to `/onboarding`; completing OR
  skipping onboarding lands on `/` (Today); returning visitors go straight
  to Today. First-visit detection mechanism (localStorage vs cookie,
  client vs middleware) is the agent's discretion, but the behavior is
  locked: fresh browser → onboarding, known visitor → Today.
- **D-02**: The onboarding wizard is navigable end-to-end: Back/Continue
  advance through the five setup steps (today it is frozen at "Step 3 of
  5"). The final step's Continue completes setup and lands on Today.
  Steps beyond step 3 (bridge, schedule) can be lightweight — the existing
  screen content per step is already designed; step content is the agent's
  discretion where missing, matching the spec's setup order (table → agent
  → ways to save → bridge → schedule).

### Navigation Completeness (locked)
- **D-03**: TopNav reaches all five primary destinations: Today `/`,
  Subjects `/subjects`, Listen `/listen`, Library `/library`, Pipeline
  `/pipeline`.
- **D-04**: `/subjects` is a NEW subjects index screen listing all subjects
  from `/api/subjects`, built in the existing visual language (inline
  styles, same card/list idioms as Today's subject cards). The TopNav
  Subjects tab and every hardcoded `/subjects/AI Agents` link point to it.
- **D-05**: Every navigation-labeled dead span becomes a working link.
  Known offenders (verify by grep for non-Link `<span` controls):
  Home Finance tile and see-all arrows; Listen sidebar (Today / Subjects /
  Library / Pipeline); Session icon rail and all Session CTAs; Subject
  page Continue / Listen / Review; Pathway "Switch to Listen" and
  "Continue where you left off"; Quiz "Next question" advances.
  Non-navigational action buttons (Save a link, Run now, Retry all,
  Search, Export, Rename, Rebuild, Schedule) are OUT of this phase — leave
  them visually unchanged.
- **D-06**: `/session` is integrated: reachable from the primary interface
  (agent's discretion: TopNav affordance or a Today link such as "switch
  to session view") and its own links (logo, pipeline, subject tiles)
  already/to become working.

### Study Loop (locked)
- **D-07**: From a subject the user can: open its pathway
  (`/pathway/[subjectId]`), start a quiz for that subject, and start
  listening for that subject. Quiz (`/quiz`) and Listen (`/listen`) accept
  subject context (route param or query param — agent's discretion);
  without context they keep current defaults.
- **D-08**: Quiz and Listen exit/back controls return to the subject they
  were launched from (not a hardcoded `/subjects/AI Agents`). Fix the
  unencoded href `/subjects/AI Agents` (space in URL) wherever it appears.
- **D-09**: Deep screens (subject detail, pathway, print) offer a working
  way back to their origin (subject → subjects index or Today;
  pathway → its subject).

### Correctness (locked)
- **D-10**: Unknown subjectId/pathwayId renders Next's not-found state
  (404) instead of the silent AI Agents fallback in
  `lib/store.js getSubjectById`. Client components fetching
  `/api/subjects/[id]` must surface not-found, not render the fallback.

### Design Constraints (locked)
- **D-11**: No visual redesign. Preserve the existing inline-style design
  language, layout, and copy of every existing screen. New screens
  (subjects index, any onboarding steps) match the established idioms.
- **D-12**: Next.js 16 conventions per `AGENTS.md` — read the bundled docs
  in `node_modules/next/dist/docs/` before writing route/navigation code;
  do not rely on training-data Next.js APIs.

### the agent's Discretion
- First-visit detection mechanism (localStorage flag vs cookie; client
  redirect vs middleware)
- Onboarding step content for steps 4-5 (bridge, schedule) — lightweight is
  fine, matching the spec's setup order
- Subject-context mechanism for quiz/listen (query param vs route param)
- Exact placement of the Session entry affordance
- Whether pathway stage reorder persists (local state acceptable this
  phase — persistence is data-layer work)
- Component extraction granularity (shared back-link component vs inline)

### Deferred Ideas (OUT OF SCOPE)
- Real integrations: Baserow/Telegram/Firecrawl/Gemini Notebook (spec
  Setup; INTG-01/02)
- Audio playback behind the Listen waveform (AUDIO-01)
- Data wiring: real subject sources, per-subject quiz from API, live
  pipeline counts, live home widgets (Phase 2, DATA-01..04)
- Capture actions: save-a-link modal, Run now on Home, search/export,
  retry (Phase 3, CAPT-01..03)
- Pipeline status-ladder transitions and run-log realism (Phase 4,
  PIPE-01/02)
- Auth, scheduling/cron, persistence beyond the in-memory store
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FLOW-01 | First-time visitors routed into onboarding; finish/skip lands on `/`; returning visitors go straight to Today | Client gate pattern (localStorage + useEffect + router.replace) documented below; proxy/cookie alternative with Next 16 `proxy.js` convention (middleware deprecated) |
| FLOW-02 | Onboarding wizard navigable; Back/Continue move through steps; final step completes into app | Wizard = `useState` step index + per-step content panels; final Continue = set flag + `<Link href="/">` or `router.push('/')`; no Next-specific API needed beyond Link |
| FLOW-03 | All five destinations reachable from global nav; Subjects opens subjects index | TopNav `TABS` array fix (`/subjects/AI Agents` → `/subjects`); new `app/(dashboard)/subjects/page.js` inherits TopNav via route-group layout |
| FLOW-04 | Study loop connected; quiz/listen carry subject context; exits return to launching subject | Query-param context via `useSearchParams` (+ mandatory Suspense) recommended; exit href built from context with `/subjects` fallback; encodeURIComponent everywhere |
| FLOW-05 | Every navigation-labeled control on Home/Library/Pipeline/Listen/Session is a working link | Full dead-span inventory (verified by grep) in Common Pitfalls/Code Examples; span→Link mechanical conversion pattern preserving inline styles |
| FLOW-06 | Invalid IDs render not-found instead of AI Agents fallback; dynamic hrefs properly encoded | `notFound()` from `next/navigation` + `not-found.js` convention; **critical**: two live sync-`params` bugs (API route + print page) must be fixed with `await params` when removing the fallback — verified empirically |
</phase_requirements>

## Project Constraints (from AGENTS.md)

- **"This is NOT the Next.js you know"** — Next 16.3.1 has breaking changes vs training data. Read bundled docs in `node_modules/next/dist/docs/` before writing route/navigation code. Do not rely on training-data Next.js APIs. **All Next API claims in this research are sourced from those bundled docs** (exact paths cited).
- The managed block in AGENTS.md is written/re-added by `next dev` — commit it with work; do not strip it from diffs.
- Project instructions also derive from `.planning/config.json`: `commit_docs: false` (planning docs stay uncommitted unless user asks), `ui_phase: false`, `tdd_mode: false`, `nyquist_validation: false`.

## Summary

This phase is pure navigation wiring over an existing design-complete Next.js 16.3.1 App Router app (JavaScript, React 19, TanStack Query, in-memory store). No new dependencies are needed — everything is built from `next/link`, `next/navigation` hooks (`useRouter`, `usePathname`, `useParams`, `useSearchParams`), the `notFound()` function + `not-found.js` convention, and React state.

The single most important discovery is that **two server-side consumers already read `params` synchronously, which is fully removed in Next 16** — `app/api/subjects/[subjectId]/route.js` and `app/pathway/[subjectId]/print/page.js`. Empirically verified on the running dev server: `GET /api/subjects/Distribution` returns AI Agents, and `/pathway/Distribution/print` renders the AI Agents heading, because `params.subjectId` is `undefined` (params is a Promise) and `getSubjectById` silently falls back to `SUBJECTS[0]`. This means D-10 (remove the fallback) and FLOW-06 (404 on bad IDs) cannot ship without first converting both consumers to `const { subjectId } = await params` — otherwise every subject detail page and every print page breaks. The plan must sequence: (1) await params in the API route + print page, (2) remove the store fallback, (3) add 404 handling, together in one task.

Second key finding: **`middleware` is deprecated and renamed `proxy` in Next 16** (`proxy.js` with `export function proxy(request)`, Node.js runtime only, edge not supported), and the bundled docs explicitly recommend avoiding it "unless no other options exist". For the D-01 first-run gate, a client-side localStorage gate (useEffect + `router.replace('/onboarding')`) is the documented-friendly, lowest-risk choice; the cookie+proxy pattern is documented as the alternative if a server-side gate is wanted.

Third: query params for quiz/listen subject context (recommended over route params because `/quiz` and `/listen` must keep working with no context) require `useSearchParams()` to be wrapped in a `<Suspense>` boundary — otherwise the **production build fails** ("Missing Suspense boundary with useSearchParams") while dev works fine, masking the problem.

**Primary recommendation:** Convert dead spans to styled `<Link>`s, build the wizard and first-run gate with React state + localStorage, pass subject context as `?subject=` query params read via `useSearchParams` inside Suspense, fix the two `await params` bugs, remove the store fallback, and render 404s with `notFound()` (server pages) + a 404 API status (client pages).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| First-visit detection + onboarding redirect (D-01) | Browser / Client (localStorage + useEffect gate) | Frontend Server (proxy.js + cookie, if chosen) | localStorage is client-only by design; bundled docs discourage proxy unless necessary [CITED: proxy.md "Migration to Proxy"] |
| Onboarding wizard step advancement (D-02) | Browser / Client (useState) | — | Pure UI state; no server round-trip needed for a mock |
| Global nav + active-tab state (D-03) | Browser / Client (Link + usePathname) | — | TopNav is already a client component using usePathname |
| Subjects index data (D-04) | API / Backend (`/api/subjects` GET) | Browser (TanStack Query fetch) | Existing API already serves SUBJECTS; index screen is a new client consumer |
| Client-side navigation (D-05, D-07, D-08, D-09) | Browser / Client (`next/link`) | — | Link handles prefetch + client transitions; spans become Links |
| Subject context for quiz/listen (D-07) | Browser / Client (URL query param + useSearchParams) | — | URL is the carrier; no server involvement needed for display-only context |
| 404 on unknown IDs — server pages (print) | Frontend Server (SSR: `await params` + `notFound()`) | — | Existence is checkable at render time on the server; real 404 status |
| 404 on unknown IDs — API | API / Backend (`await params` + 404 status) | — | Route handler owns response status |
| 404 on unknown IDs — client subject page | Browser / Client (query error state / notFound after fetch) | Frontend Server (could convert page to server component) | Page is a client component fetching via TanStack Query; see Pattern 5 tradeoffs |
| href encoding for dynamic segments (FLOW-06) | Browser / Client (`encodeURIComponent` at href-build sites) | — | Subject IDs contain spaces ("AI Agents") |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.3.1 (exact, installed) | App Router, Link, navigation hooks, notFound, file conventions | Already installed; AGENTS.md mandates its bundled docs [VERIFIED: package.json + `require('next/package.json').version`] |
| react / react-dom | 19.2.8 (installed range ^19.2.8) | `use()` hook for unwrapping params promises in client pages | Already installed [VERIFIED: package.json] |
| @tanstack/react-query | ^5.101.4 (installed) | Client data fetching for subjects index + subject detail | Already installed and used on Today/subject/session screens [VERIFIED: package.json, app/(dashboard)/page.js] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none) | — | — | This phase adds ZERO new dependencies. Do not install anything. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| localStorage client gate (D-01) | Cookie + `proxy.js` redirect | Server-side gate gives no flash-of-content and works without JS, but middleware→proxy is a deprecated-adjacent convention Next docs discourage; overkill for a personal mock [CITED: proxy.md] |
| Query param `?subject=` (quiz/listen context) | Dynamic route `/quiz/[subjectId]` | Route param is more RESTful and uses useParams (no Suspense requirement) but breaks the "works without context" requirement unless you add an optional catch-all `[[...subjectId]]` — more route restructuring for no functional gain this phase |
| In-page not-found card (client subject page) | Convert page to server component + `notFound()` | Server conversion yields a real 404 status and the standard not-found UI, but rewrites the page's data flow (TanStack Query → props) which Phase 2 (DATA-01) will revisit anyway |

**Installation:**
```bash
# Nothing to install. All APIs needed ship with next@16.3.1.
```

## Architecture Patterns

### System Architecture Diagram

```
 Browser (fresh)                       Browser (returning)
      │                                     │
      ▼                                     ▼
 [OnboardingGate in root layout]      [OnboardingGate: flag present → no-op]
  localStorage 'learnit_onboarded'
  absent → router.replace('/onboarding')
      │
      ▼
 /onboarding  (client wizard: useState step 1..5)
  Back / Continue ──► step 5 Continue or Skip
                        │  set localStorage flag
                        ▼
                  /  (Today, (dashboard) group → TopNav)
                        │
        ┌───────────────┼───────────────┬─────────────┐
        ▼               ▼               ▼             ▼
   /subjects       /library        /pipeline      /listen /session
   (NEW index,     (existing)      (existing)     (outside group,
   (dashboard))                                   own chrome)
        │
        ▼  Link per subject (encodeURIComponent)
 /subjects/[subjectId]  (client page, useParams + /api/subjects/[id])
        │
   ┌────┼──────────────────────────┐
   ▼    ▼                          ▼
 /pathway/[subjectId]   /quiz?subject=X    /listen?subject=X
 (client, useParams      (useSearchParams   (same, exit →
  + /api/subjects)        in Suspense;       /subjects/X)
   │                      exit → /subjects/X)
   ▼
 /pathway/[subjectId]/print  (SERVER page: await params,
   getSubjectById → if missing notFound() → not-found.js, HTTP 404)

 API layer: /api/subjects (list) · /api/subjects/[subjectId]
            (SERVER route handler: await params →
             found: JSON · missing: 404 status)
 Store: lib/store.js SUBJECTS (getSubjectById fallback REMOVED)
```

### Recommended Project Structure

```
app/
├── layout.js                      # root layout (add <OnboardingGate/> here)
├── providers.js                   # TanStack Query provider (unchanged)
├── onboarding/page.js             # wizard: add step state (1..5) + skip
├── not-found.js                   # NEW — root 404 (unmatched URLs + notFound())
├── (dashboard)/                   # route group: TopNav chrome, no URL impact
│   ├── layout.js                  # renders TopNav (unchanged)
│   ├── page.js                    # Today — Finance tile → Link, etc.
│   ├── subjects/
│   │   ├── page.js                # NEW — subjects index (/subjects)
│   │   └── [subjectId]/page.js    # subject detail (client, useParams)
│   ├── quiz/page.js               # add ?subject= context + working Exit
│   ├── pathway/[subjectId]/page.js# breadcrumbs → Links; Switch-to-Listen → Link
│   ├── library/page.js            # nav-labeled controls only (actions stay)
│   └── pipeline/page.js           # (verify: nav-labeled controls only)
├── listen/page.js                 # sidebar spans → Links; accept ?subject=
├── session/page.js                # rail icons → Links; CTAs → Links
└── pathway/[subjectId]/print/page.js  # SERVER: await params + notFound()
components/
├── TopNav.js                      # Subjects tab → /subjects (+ Session affordance?)
└── (optional) OnboardingGate.js, BackLink.js — extraction is agent's discretion
lib/store.js                       # getSubjectById: remove SUBJECTS[0] fallback
app/api/subjects/[subjectId]/route.js  # await params; 404 when missing
```

### Pattern 1: Dead span → styled Link (D-05, FLOW-05)
**What:** Replace `<span style={...}>Label</span>` with `<Link href={...} style={{...same, textDecoration: 'none'}}>` so the visual output is pixel-identical but the control navigates.
**When to use:** Every navigation-labeled span in the verified inventory below. NOT for action buttons (Save a link, Run now, Search, Export, Rename, Rebuild — out of scope per D-05).
**Example:**
```jsx
// Source: codebase precedent app/(dashboard)/page.js:104-108 + [CITED: node_modules/next/dist/docs/01-app/03-api-reference/02-components/link.md]
// BEFORE (dead span, listen sidebar)
<span style={{ padding: '10px 12px', borderRadius: 12, fontSize: 13.5, color: palette.textSecondary }}>Subjects</span>

// AFTER (working link, same look)
<Link href="/subjects" style={{ padding: '10px 12px', borderRadius: 12, fontSize: 13.5, color: palette.textSecondary, textDecoration: 'none' }}>Subjects</Link>
```
`<Link>` renders an `<a>`; standard attributes (style, className, target) pass through [CITED: link.md "Good to know"]. Codebase precedent for the underline-kill + inline-style pattern already exists (home subject cards, quiz Exit).

### Pattern 2: First-run gate (D-01, FLOW-01) — RECOMMENDED client gate
**What:** A tiny client component mounted in the root layout that redirects to `/onboarding` when a localStorage flag is absent.
**When to use:** Default recommendation for this mock app. Alternative (cookie + proxy.js) documented in State of the Art.
**Example:**
```jsx
// Source: composed from [CITED: use-router.md] + [CITED: use-search-params.md router-events pattern]
// components/OnboardingGate.js
'use client'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

const FLAG = 'learnit_onboarded'

export default function OnboardingGate() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (pathname === '/onboarding') return          // no gate on onboarding itself
    if (!window.localStorage.getItem(FLAG)) {
      router.replace('/onboarding')                  // replace: no history entry
    }
  }, [pathname, router])

  return null
}

// app/layout.js — mount inside <Providers> (or beside it):
//   <Providers><OnboardingGate />{children}</Providers>
```
Onboarding completion / skip sets `localStorage.setItem(FLAG, '1')` then navigates to `/` (a plain `<Link href="/">` is enough; no router needed). `replace` (not `push`) so Back from Today doesn't return into the wizard. localStorage must be touched inside `useEffect` only — reading it during render causes hydration mismatch. Gate lives in the ROOT layout so it covers `/listen`, `/session`, and deep links too, not just dashboard pages.

### Pattern 3: Subject context via query param + Suspense (D-07, FLOW-04)
**What:** `/quiz?subject=AI%20Agents` and `/listen?subject=...`; pages keep current defaults when the param is absent.
**When to use:** Quiz and Listen (both are `'use client'` pages that must work context-free — query param satisfies "optional" cleanly).
**Example:**
```jsx
// Source: [CITED: use-search-params.md — "We recommend wrapping the Client Component
// that uses useSearchParams in a <Suspense/> boundary" + production build failure note]
// app/(dashboard)/quiz/page.js
import { Suspense } from 'react'

export default function QuizPage() {
  return (
    <Suspense fallback={null /* or a same-size skeleton */}>
      <QuizScreen />
    </Suspense>
  )
}

function QuizScreen() {
  const searchParams = useSearchParams()          // from next/navigation
  const subject = searchParams.get('subject')     // null when absent → current defaults
  const backHref = subject ? `/subjects/${encodeURIComponent(subject)}` : '/subjects'
  // Exit: <Link href={backHref}>Exit</Link>
}
```
Launchers build the href: subject page "Retake" → `/quiz?subject=${encodeURIComponent(subject.id)}`; "♪ Listen" → `/listen?subject=...`; pathway "Switch to Listen" → `/listen?subject=...`. The Suspense wrapper is MANDATORY for build: "During production builds, a static page that calls useSearchParams from a Client Component must be wrapped in a Suspense boundary, otherwise the build fails" [CITED: use-search-params.md]. Dev mode does not enforce it — do not skip it just because dev works.

### Pattern 4: Server page/route params are Promises — await them (FLOW-06, D-10 prerequisite)
**What:** In Next 16, `params` in page.js and route.js is a Promise; sync access is fully removed.
**When to use:** `app/pathway/[subjectId]/print/page.js` and `app/api/subjects/[subjectId]/route.js` — BOTH currently broken (verified below).
**Example:**
```jsx
// Source: [CITED: dynamic-routes.md] + [CITED: version-16.md "Async Request APIs (Breaking change)"]
// app/api/subjects/[subjectId]/route.js — BEFORE (broken: params.subjectId is undefined)
export async function GET(request, { params }) {
  return NextResponse.json(getSubjectById(decodeURIComponent(params.subjectId)))
}

// AFTER
export async function GET(request, { params }) {
  const { subjectId } = await params
  const subject = getSubjectById(decodeURIComponent(subjectId))
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }
  return NextResponse.json(subject)
}
```
Client pages must NOT read params from props synchronously either: a client PAGE unwraps the params prop with React `use(params)`, or any client component uses `useParams()` from `next/navigation` [CITED: dynamic-routes.md "In Client Components"; use-params.md]. The existing client subject/pathway pages already use `useParams()` — correct, leave that part.

### Pattern 5: 404 surfacing (D-10, FLOW-06)
**What:** Unknown subjectId → Next not-found state; store fallback removed.
**When to use:** Three consumers, three mechanisms:
```jsx
// (a) lib/store.js — remove the silent fallback
export function getSubjectById(id) {
  return SUBJECTS.find((s) => s.id === id)      // undefined when missing — INTENTIONAL
}

// (b) print page (SERVER component) — real 404 [CITED: not-found.md function]
import { notFound } from 'next/navigation'
export default async function PathwayPrintPage({ params }) {
  const { subjectId } = await params
  const subject = getSubjectById(decodeURIComponent(subjectId))
  if (!subject) notFound()                        // throws → nearest not-found.js, HTTP 404
  ...
}

// (c) subject detail page (CLIENT, TanStack Query) — surface the API's 404
async function fetchSubject(subjectId) {
  const res = await fetch(`/api/subjects/${encodeURIComponent(subjectId)}`)
  if (res.status === 404) notFound()              // throws in render path after query resolves
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
```
Caveats for (c), stated honestly: the bundled docs document `notFound()` for Server Components, Server Functions, and Route Handlers — client components are not listed [CITED: not-found.md]. However the client error boundary in the shipped runtime explicitly detects the `NEXT_HTTP_ERROR_FALLBACK;404` digest (`node_modules/next/dist/client/components/http-access-fallback/http-access-fallback.js` exports `isHTTPAccessFallbackError`) [VERIFIED: runtime source], so a client-thrown `notFound()` renders the not-found boundary after hydration (soft 404: initial HTML was 200). If the planner prefers strictly-documented behavior, the alternative is an in-page not-found card (same visual language, link back to `/subjects`) driven by the query's error state. Either satisfies "surface not-found, not render the fallback"; the server print page + API give real 404 statuses regardless.

`not-found.js` placement [CITED: file-conventions/not-found.md]: a root `app/not-found.js` covers (1) any `notFound()` throw with no nearer boundary and (2) ALL unmatched URLs app-wide. A segment-level `app/(dashboard)/subjects/[subjectId]/not-found.js` renders inside the dashboard chrome for a styled in-context 404. `global-not-found.js` is experimental + needs a config flag — NOT needed (single root layout).

### Anti-Patterns to Avoid
- **`<a href>` or `window.location` for internal navigation:** loses client-side transitions, prefetching, shared-layout state. Use `<Link>` / `useRouter` [CITED: linking-and-navigating.md].
- **Reading `params.subjectId` synchronously anywhere:** fully removed in Next 16 — this is the exact live bug in this repo [CITED: version-16.md; VERIFIED: dev-server repro].
- **`useSearchParams()` without a Suspense boundary:** production build failure [CITED: use-search-params.md].
- **Unencoded interpolation `/subjects/${subject.id}`** with space-containing IDs ("AI Agents"): works-by-luck in dev; always `encodeURIComponent(subject.id)` at href-build sites. Conversely, note the codebase double-decodes on read (`decodeURIComponent(useParams().subjectId)`) — safe for current IDs (no `%` chars) but a `URIError` hazard if IDs ever contain `%`; keep one decode point and validate against the store.
- **Calling `redirect()` in an event handler:** documented as unsupported — use `useRouter().push/replace` in handlers; `redirect()` is render-path only [CITED: redirect.md].
- **Creating `middleware.ts`:** deprecated convention in 16; if a server gate is ever wanted it is `proxy.js` + `export function proxy` [CITED: proxy.md, version-16.md].
- **Nesting a `<Link>` inside another `<Link>`** while converting spans (e.g. inside the home subject-card Links): invalid HTML; convert the outer card only, or the inner control only.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Client-side navigation | `<a>`/`onClick={() => location.assign(...)}` | `next/link` `<Link>` | Prefetch, client transitions, scroll handling, interruptible navigation [CITED: linking-and-navigating.md] |
| Programmatic navigation | `window.location.href = ...` in handlers | `useRouter().push/replace/back()` from `next/navigation` | Keeps SPA state, history semantics, scroll control [CITED: use-router.md] |
| 404 UI + status | Custom `/404` route or `res.status(404)` HTML strings | `notFound()` + `not-found.js` convention | Wired into the router, correct status + `noindex`, per-segment boundaries [CITED: not-found.md, file-conventions/not-found.md] |
| URL segment encoding | `.replace(' ', '%20')` / `.split(' ').join('-')` | `encodeURIComponent` / `decodeURIComponent` | Handles all reserved chars, not just spaces |
| Query-param state parsing | `window.location.search` string parsing | `useSearchParams()` (client) / `searchParams` prop (server page) | Read-only URLSearchParams interface, Suspense-aware prerendering [CITED: use-search-params.md] |
| Active-tab highlighting | Manual pathname parsing | `usePathname()` (already in TopNav) | Existing pattern; keep it [VERIFIED: components/TopNav.js] |

**Key insight:** Every problem in this phase is already solved by a shipped Next 16 API that the bundled docs cover. The phase's real risk is not missing libraries — it is using removed/renamed APIs from training data (sync params, middleware, legacyBehavior).

## Common Pitfalls

### Pitfall 1: The silent-fallback mask over the sync-params bug (CRITICAL, verified)
**What goes wrong:** Removing `getSubjectById`'s `?? SUBJECTS[0]` fallback before fixing its callers crashes or blank-renders every subject page/print page.
**Why it happens:** `app/api/subjects/[subjectId]/route.js:5` and `app/pathway/[subjectId]/print/page.js:6` read `params.subjectId` synchronously. In Next 16 `params` is a Promise, so `params.subjectId` is `undefined`; `decodeURIComponent(undefined)` yields the string `"undefined"`; the store fallback silently maps that to AI Agents. Verified on the running dev server: `curl /api/subjects/Distribution` → AI Agents JSON; `/pathway/Distribution/print` → `<h1>AI Agents</h1>`; `/subjects/DoesNotExist` and `/pathway/DoesNotExist/print` both return HTTP 200 [VERIFIED: dev-server repro, 2026-08-14].
**How to avoid:** One task fixes all three together: `await params` in both server consumers → remove store fallback → add 404s. Verification step: `curl localhost:3000/api/subjects/Distribution` must return Distribution; `curl -o /dev/null -w '%{http_code}' localhost:3000/pathway/Nope/print` must be 404.
**Warning signs:** subject detail page shows "AI Agents" header for every subject; print export always titled AI Agents.

### Pitfall 2: useSearchParams without Suspense — dev works, build fails
**What goes wrong:** `npm run build` fails with "Missing Suspense boundary with useSearchParams" after the phase's dev testing passed.
**Why it happens:** Enforcement is production-build-only; in dev "routes are rendered on-demand, so useSearchParams doesn't suspend" [CITED: use-search-params.md].
**How to avoid:** Wrap every component calling `useSearchParams()` in `<Suspense>` at its page (Pattern 3). Verification: run `npm run build` as a phase gate.
**Warning signs:** quiz/listen pages read `?subject=` fine in dev.

### Pitfall 3: Deprecated/removed APIs a planner might assume from training data
**What goes wrong:** Code written against Next 13/14/15 conventions silently no-ops or throws.
**Why it happens:** Training data predates Next 16. Specifics verified in bundled docs:
- `middleware.ts` + `export function middleware` — deprecated, renamed `proxy.ts`/`proxy.js` with `export function proxy(request)`; proxy runs Node.js runtime only (edge NOT supported in proxy); codemod `npx @next/codemod@canary middleware-to-proxy .` exists [CITED: proxy.md, version-16.md].
- Sync `params`/`searchParams`/`cookies()`/`headers()` — sync access fully removed in 16 (15 had a compat period) [CITED: version-16.md].
- `legacyBehavior` on `<Link>` — absent from the Link API entirely (props: href, replace, scroll, prefetch, onNavigate, transitionTypes) [CITED: link.md].
- `router.events` — replaced by composing usePathname/useSearchParams [CITED: use-router.md].
- `next lint` — removed; `next build` no longer lints [CITED: version-16.md].
- Turbopack is the default for dev+build in 16 [CITED: version-16.md].
**How to avoid:** Treat bundled docs as the only API source (AGENTS.md directive); this research's Code Examples are all doc-sourced.
**Warning signs:** any review comment citing "middleware", "legacyBehavior", or sync params.

### Pitfall 4: Space-containing subject IDs in URLs
**What goes wrong:** `/subjects/AI Agents` (literal space, TopNav.js:8 and quiz Exit at quiz/page.js:34 today) is a malformed href; unencoded template hrefs (`/pathway/${subject.id}/print`, pathway page lines 74/84) drift the same way.
**Why it happens:** Subject IDs are human names with spaces ("AI Agents", from the spec's Title Case rule).
**How to avoid:** Every dynamic href is built with `encodeURIComponent(id)`; every read decodes exactly once. The TopNav Subjects tab and quiz Exit point at `/subjects` (index) or an encoded subject URL — never a raw string with a space.
**Warning signs:** grep for `href={` without `encodeURIComponent` in the same expression; grep for literal `AI Agents` inside href strings (exactly 2 sites today [VERIFIED: grep]).

### Pitfall 5: Hydration-time localStorage read (gate flash/mismatch)
**What goes wrong:** Gate reads localStorage during render → server HTML (no localStorage) differs from client → hydration mismatch, or Today flashes before redirect.
**Why it happens:** localStorage is browser-only.
**How to avoid:** All flag reads/writes inside `useEffect`; render `null` from the gate. A brief content flash before `router.replace` is expected and acceptable for this mock (a cookie+proxy gate is the flash-free alternative if the user objects).
**Warning signs:** console hydration warnings; "flicker" complaints in review.

### Pitfall 6: Breaking the "works without context" default (D-07)
**What goes wrong:** Converting `/quiz` to `/quiz/[subjectId]` 404s the existing TopNav-less direct visits and the listen page's "Quiz me after" link.
**Why it happens:** Route params are not optional without catch-all restructuring (`[[...subjectId]]`).
**How to avoid:** Query param carries context; absence = current defaults. Exit hrefs derive from the param with `/subjects` fallback.

### Pitfall 7: Scope creep into action buttons / Phase 2-4 work
**What goes wrong:** "Make every control work" swallows Save-a-link, Run now, search/export, retry — explicitly OUT of this phase (D-05; CAPT/PIPE phases).
**How to avoid:** Only navigation-labeled controls convert to Links. Action buttons stay visually unchanged spans. Quiz "Next question" is in-page state advancement (`QUESTION_INDEX` state + reset `picked`), not navigation. Data realism (per-subject quiz content, real source rows) is Phase 2 — e.g. quiz/page.js importing `QUIZ_ITEMS` from lib/store.js is a known Phase-2 item (DATA-02), do NOT fix now.

## Code Examples

Verified patterns (all sourced from bundled docs at `node_modules/next/dist/docs/` or existing codebase):

### TopNav fix (D-03, FLOW-03)
```jsx
// Source: components/TopNav.js:6-12 [VERIFIED: codebase]
const TABS = [
  { label: 'Today', to: '/', match: (p) => p === '/' },
  { label: 'Subjects', to: '/subjects', match: (p) => p.startsWith('/subjects') }, // was '/subjects/AI Agents'
  { label: 'Listen', to: '/listen', match: (p) => p.startsWith('/listen') },
  { label: 'Library', to: '/library', match: (p) => p.startsWith('/library') },
  { label: 'Pipeline', to: '/pipeline', match: (p) => p.startsWith('/pipeline') },
]
```
The match predicate already handles the index (`/subjects`) and detail (`/subjects/X`) — only `to` changes.

### Client page reading params (existing, correct)
```jsx
// Source: app/(dashboard)/subjects/[subjectId]/page.js:20-21 [VERIFIED: codebase]
import { useParams } from 'next/navigation'
const { subjectId } = useParams()          // hook — no await needed in client components
const name = decodeURIComponent(subjectId)
```
Alternative for client PAGES specifically: unwrap the params prop with React's `use()` [CITED: dynamic-routes.md].

### Onboarding wizard skeleton (D-02)
```jsx
// Source: composed from existing app/onboarding/page.js STEPS array + [CITED: link.md]
const [step, setStep] = useState(3)        // current screen is designed as step 3
// STEPS flags (done/active) derive from `step` instead of being hardcoded
<span onClick={() => setStep((s) => Math.max(1, s - 1))} style={/* existing Back pill styles */}>Back</span>
{step < 5
  ? <span onClick={() => setStep((s) => s + 1)} style={/* existing Continue styles */}>Continue…</span>
  : <Link href="/" replace onClick={() => localStorage.setItem('learnit_onboarded', '1')}
      style={/* existing Continue styles, textDecoration:'none' */}>Finish setup</Link>}
```
Step content panels follow the spec's setup order: 1 table → 2 agent → 3 ways to save (already designed) → 4 bridge → 5 schedule [VERIFIED: SPEC pp.2-10]. Steps 4-5 are lightweight (agent's discretion). "Skip" affordance per D-01 can reuse the same flag-setting Link.

### Route handler with 404 (D-10)
```jsx
// Source: [CITED: not-found.md "Serving a 404 from a Route Handler"] — notFound() also works in route handlers
import { notFound } from 'next/navigation'
export async function GET(request, { params }) {
  const { subjectId } = await params
  const subject = getSubjectById(decodeURIComponent(subjectId))
  if (!subject) notFound()                 // serves 404 — or return NextResponse.json(..., { status: 404 })
  return NextResponse.json(subject)
}
```

## Verified Dead-Control Inventory (D-05 input)

Grep-verified locations of navigation-labeled non-Link controls [VERIFIED: grep, 2026-08-14]:

| Screen | File:line | Control(s) | Target |
|--------|-----------|------------|--------|
| Home | `app/(dashboard)/page.js:120-126` | Finance tile (whole row) | `/subjects/Finance`… but Finance is not in SUBJECTS — link to `/subjects` (planner: index or a not-found demo) |
| Home | `app/(dashboard)/page.js:66-67` | "Save a link" / "Run now" | OUT OF SCOPE (actions) |
| Listen | `app/listen/page.js:51-55` | Sidebar Today/Subjects/Library/Pipeline spans | `/`, `/subjects`, `/library`, `/pipeline` |
| Listen | `app/listen/page.js:112` | "Read instead" | subject pathway or subject page (context-derived) |
| Session | `app/session/page.js:24-27` | Rail icons ▤ ♪ ? ◍ | subjects / listen / quiz / pathway (agent's discretion on exact mapping) |
| Session | `app/session/page.js:55-56` | "Continue reading" / "♪ Listen instead" | `/pathway/AI%20Agents` / `/listen?subject=AI%20Agents` |
| Session | `app/session/page.js:82-88` | "Waiting on you" rows | `/subjects` (+ rename row: out of scope, it's an action) |
| Subject | `app/(dashboard)/subjects/[subjectId]/page.js:111-112` | "Continue" / "♪ Listen" | `/pathway/{id}` / `/listen?subject={id}` |
| Subject | same:126 | "Read again" (briefing) | `/pathway/{id}` (planner discretion) |
| Subject | same:140,143 | "Retake" (already Link to `/quiz` — add context) / "Review misses" | `/quiz?subject={id}` / same or pathway |
| Pathway | `app/(dashboard)/pathway/[subjectId]/page.js:69-71` | Breadcrumb "Subjects" span | `/subjects` |
| Pathway | same:75-76 | "♪ Switch to Listen" / "Continue where you left off" | `/listen?subject={id}` / in-page scroll or `/pathway/{id}#active` (planner) |
| Pathway | same:141 | Stage action pills (Continue/Review) | active stage → study-guide destination (planner; lightweight OK) |
| Quiz | `app/(dashboard)/quiz/page.js:34` | Exit Link (hardcoded `/subjects/AI Agents`) | context-derived backHref (Pattern 3) |
| Quiz | same:70-71 | "Skip" (works — resets pick) / "Next question" | Next = advance `QUESTION_INDEX` state (in-page), not navigation |
| Onboarding | `app/onboarding/page.js:171-172` | Back / Continue spans | wizard state (D-02) |
| Onboarding | same:136,152 | "Set up later" spans | advance step or finish (planner) |
| Library | `app/(dashboard)/library/page.js:189-198` | header Search/Export/Save spans | OUT OF SCOPE (CAPT-03 actions) |

Hardcoded `/subjects/AI Agents` (unencoded space) — exactly 2 sites [VERIFIED: grep]: `components/TopNav.js:8`, `app/(dashboard)/quiz/page.js:34`.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` + `export function middleware` | `proxy.ts/js` + `export function proxy`; Node.js runtime only | v16.0.0 | Don't create middleware.ts; docs discourage proxy unless necessary |
| Sync `params`/`searchParams` props (≤14) / compat access (15) | Promise props — `await` (server) / `use()` (client page) / `useParams()` (any client) | Sync removed v16.0.0 | Two live bugs in this repo (API route, print page) |
| `<Link legacyBehavior>` child `<a>` | plain `<Link>` (child-a removed since 13; legacyBehavior now absent from API) | v13.0.0 / absent in 16 docs | Never add legacyBehavior |
| `router.events` (Pages-style) | compose `usePathname` + `useSearchParams` in effects | App Router era | For nav-driven side effects |
| `next lint` / lint-on-build | ESLint/Biome CLI directly; build doesn't lint | v16.0.0 | Verification relies on dev server + build + curl checks |
| `dynamic = 'force-dynamic'` | prefer `connection()` from `next/server` (if ever needed) | v16 docs | Not needed this phase |
| AMP, `serverRuntimeConfig`, `images.domains`, `unstable_rootParams` | removed | v16.0.0 | N/A here, listed to fence training-data assumptions |

**Deprecated/outdated to actively avoid:** middleware convention; sync request APIs; `next/legacy/image`; `revalidateTag` single-arg form; `experimental_ppr` [CITED: version-16.md].

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `notFound()` thrown from a client component render renders the not-found boundary after hydration (docs list only Server Components/Server Functions/Route Handlers; client runtime source contains the digest matcher) | Pattern 5 | Low-medium: fallback is an in-page not-found card (same requirement satisfied); verify in browser during execution |
| A2 | `useParams()` returns URL-decoded param values in this version (docs silent; codebase double-decodes today) | Pitfall 4 | Low: current IDs ("AI Agents", "Distribution", "Sales") decode identically either way; hazard only for IDs containing `%` |
| A3 | "See-all arrows" beyond the Finance tile are minimal (grep found no other literal see-all strings; Home FRESH_MATERIAL cards are navigation-plausible but not listed in D-05 — treated as planner discretion) | Inventory | Low: D-05 list is authoritative; planner decides card linkage |
| A4 | Content flash before the localStorage gate redirects is acceptable for this mock | Pattern 2 | Low: cookie+proxy alternative documented if user objects |

All other claims are `[VERIFIED: ...]` (dev-server repro, codebase grep, installed package.json) or `[CITED: node_modules/next/dist/docs/...]` (bundled official docs).

## Open Questions

All open questions were resolved during research; none block planning. The four assumptions above (A1-A4) each carry a documented fallback and are flagged for the planner where relevant.

## Environment Availability

Step 2.6 audit: no external dependencies — the phase is code-only against already-installed packages. Verified: `npm run dev` (Next 16.3.1, Turbopack) starts and serves correctly; Node runtime satisfies Next 16's ≥20.9 requirement by demonstration [VERIFIED: dev server run].

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js ≥20.9 | Next 16 runtime | ✓ | satisfies (dev server ran) | — |
| next | all | ✓ | 16.3.1 exact | — |
| @tanstack/react-query | subjects index, subject page | ✓ | ^5.101.4 | — |

## Sources

### Primary (HIGH confidence)
- `node_modules/next/dist/docs/01-app/03-api-reference/02-components/link.md` — Link props, version history (v16.2.0 transitionTypes), no legacyBehavior
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/dynamic-routes.md` — params Promise, `use(params)` in client pages, useParams
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` — middleware→proxy rename, cookies API, matcher, "last resort" guidance
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/not-found.md` — not-found.js + global-not-found.js (experimental), root coverage of unmatched URLs
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md` — searchParams Promise prop, `use(searchParams)`
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route-groups.md` — group semantics, path-conflict caveat
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/not-found.md` — throw semantics, route-handler 404, streaming status caveat
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-search-params.md` — Suspense/build-failure requirement, server alternatives
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-router.md` — push/replace/back, events replacement
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/redirect.md` — render-path only, not event handlers
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-params.md` — client params hook
- `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md` — sync request APIs removed, middleware→proxy, Turbopack default, removals list
- `node_modules/next/dist/docs/01-app/01-getting-started/04-linking-and-navigating.md` — prefetch/streaming/client transitions

### Empirical verification (this session)
- Dev server run (Next 16.3.1 Turbopack): `/api/subjects/Distribution` → AI Agents JSON; `/pathway/Distribution/print` → AI Agents h1; both unknown-ID URLs → HTTP 200 (fallback + sync-params bugs confirmed)
- Codebase greps: dead-span inventory; exactly 2 hardcoded `/subjects/AI Agents` sites; 2 unencoded dynamic-href template sites
- `node_modules/next/dist/client/components/http-access-fallback/http-access-fallback.js` — client not-found digest matcher exists

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zero new deps; versions read from installed package.json
- Architecture: HIGH — all patterns sourced from bundled Next 16.3.1 docs (exact version installed) + existing codebase precedent
- Pitfalls: HIGH — Pitfall 1 verified empirically on the running app; deprecation list from the bundled v16 upgrade guide

**Research date:** 2026-08-14
**Valid until:** 2026-09-14 (stable, codebase-local; bundled docs are version-pinned to the installed next)
