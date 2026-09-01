---
phase: 01-connect-screens
reviewed: 2026-08-14T18:03:50Z
depth: standard
files_reviewed: 15
files_reviewed_list:
  - app/(dashboard)/page.js
  - app/(dashboard)/pathway/[subjectId]/page.js
  - app/(dashboard)/quiz/page.js
  - app/(dashboard)/subjects/[subjectId]/page.js
  - app/(dashboard)/subjects/page.js
  - app/api/subjects/[subjectId]/route.js
  - app/layout.js
  - app/listen/page.js
  - app/not-found.js
  - app/onboarding/page.js
  - app/pathway/[subjectId]/print/page.js
  - app/session/page.js
  - components/OnboardingGate.js
  - components/TopNav.js
  - lib/store.js
findings:
  critical: 1
  warning: 2
  info: 6
  total: 9
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-08-14T18:03:50Z
**Depth:** standard
**Files Reviewed:** 15
**Status:** issues_found

## Summary

Reviewed all 15 files wired in this phase (navigation, onboarding gate, dynamic routes, API route, not-found flow). The overall wiring is sound: `useSearchParams` is correctly Suspense-wrapped on `/quiz` and `/listen`, dynamic pages await/decode params defensively with try/catch, the subject API returns proper 404s, and the client-side `notFound()` calls follow the documented render-path pattern.

One critical, user-reachable crash exists in the pathway page: the stage-reorder `order` state survives client-side navigation between subjects (Next.js App Router pages do not remount when only dynamic params change — only `template.js` segments remount, per the bundled docs). A stale permutation applied to a subject with fewer stages indexes past the end of `subject.stages`, producing `undefined` entries that throw on `.status` access. Additionally, three pages have no query-error branch and will show "Loading…" forever if an API call rejects, and the localStorage onboarding gate reads/writes storage without guarding against `SecurityError` in storage-blocked browsers.

## Critical Issues

### CR-01: Stale stage-reorder state crashes page when switching subjects

**File:** `app/(dashboard)/pathway/[subjectId]/page.js:46-53`
**Issue:** `order` is `useState(null)` and is only ever set by the ▲/▼ reorder buttons (`moveStage`, lines 56-62). It is never reset when `subjectId` changes. The subject chips at lines 87-95 (`subjects.map(... <Link href={/pathway/${s.id}}>`) trigger client-side navigation between values of the same dynamic segment — the page component does NOT remount in this case (per `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/template.md`: only templates remount on dynamic-param change), so `order` persists.

Repro: open `/pathway/AI%20Agents` (4 stages), click any ▲/▼ once (sets e.g. `order = [1,0,2,3]`), then click the "Distribution" chip (3 stages). On the next render:
- `activeOrder = order ?? identity` (line 51) is the stale 4-element permutation
- `orderedRaw = activeOrder.map((i) => subject.stages[i])` (line 52) contains `undefined` (index 3 does not exist in a 3-stage subject)
- `orderedRaw.filter((s) => s.status === 'done')` (line 53) — and `decorateStage(raw, ...)` reading `raw.status` (line 14) — throw `TypeError: Cannot read properties of undefined (reading 'status')`, unmounting the page.

All three seeded subjects have different stage counts (4/3/2), so any reorder followed by any subject switch crashes. Note `moveStage`'s own bounds check (line 58) cannot help because it validates against the stale `activeOrder`, not the new subject.
**Fix:** Scope the custom order to the current subject (or reset it when the param changes), e.g. keep a per-subject map:

```js
const [orders, setOrders] = useState({})
// after `subject` is resolved:
const activeOrder = orders[subject.id] ?? subject.stages.map((_, i) => i)

function moveStage(i, dir) {
  const j = i + dir
  if (j < 0 || j >= activeOrder.length) return
  const next = activeOrder.slice()
  ;[next[i], next[j]] = [next[j], next[i]]
  setOrders((prev) => ({ ...prev, [subject.id]: next }))
}
```

(Optionally also clamp defensively: `activeOrder.filter((i) => i >= 0 && i < subject.stages.length)`.)

## Warnings

### WR-01: No error branch for failed queries — pages stuck on "Loading…" forever

**File:** `app/(dashboard)/subjects/page.js:14`, `app/(dashboard)/pathway/[subjectId]/page.js:49`, `app/(dashboard)/subjects/[subjectId]/page.js:35`
**Issue:** All three pages gate rendering on `data` alone (`if (!subjects) return <div>Loading…</div>` / `if (!subject) return ... Loading…`). None destructures `isError`/`error` from `useQuery`. If `/api/subjects` or `/api/subjects/[subjectId]` rejects (500, network failure, dev server restart), `data` stays `undefined` indefinitely and the user sees a permanent "Loading…" with no feedback or retry. The subject-detail page handles the 404 case (`fetchSubject` returns `null`), but thrown non-404 errors hit the same dead end. (Home and session pages degrade gracefully via `??` fallbacks, so this is inconsistent across screens.)
**Fix:** Destructure and branch on error, e.g.:

```js
const { data: subjects, isError, error } = useQuery({ queryKey: ['subjects'], queryFn: fetchSubjects })

if (isError) return <div style={{ padding: 40, color: '#c2451a' }}>Could not load subjects — {error.message}</div>
if (!subjects) return <div style={{ padding: 40, color: '#8b889f' }}>Loading…</div>
```

### WR-02: Unguarded `localStorage` access in the gate and onboarding CTAs

**File:** `components/OnboardingGate.js:14`, `app/onboarding/page.js:275`, `app/onboarding/page.js:294`
**Issue:** `window.localStorage.getItem/setItem` can throw a `SecurityError` when storage access is blocked (sandboxed iframes, storage-disabled browser settings). The gate runs in the root layout on every route, so a throw here breaks the entire app. On the onboarding page, if `setItem` throws inside the Link's `onClick`, the Link still navigates to `/`, and the gate (flag unset) immediately redirects back to `/onboarding` — a redirect ping-pong the user cannot escape.
**Fix:** Wrap storage access in a safe helper used by both files:

```js
// lib/onboardFlag.js
export const ONBOARDED_FLAG = 'learnit_onboarded'
export function isOnboarded() {
  try { return window.localStorage.getItem(ONBOARDED_FLAG) != null } catch { return false }
}
export function markOnboarded() {
  try { window.localStorage.setItem(ONBOARDED_FLAG, '1') } catch { /* storage unavailable */ }
}
```

## Info

### IN-01: `fetchSubjects` duplicated in four files

**File:** `app/(dashboard)/page.js:7-10`, `app/(dashboard)/subjects/page.js:6-9`, `app/(dashboard)/pathway/[subjectId]/page.js:8-11`, `app/session/page.js:8-11`
**Issue:** The identical helper (and the `['subjects']` query boilerplate) is copy-pasted four times; a future change (e.g. adding an `ok` check per WR-01) must be made in four places.
**Fix:** Extract `fetchSubjects` (and optionally a `useSubjects()` hook) into `lib/`.

### IN-02: Onboarding flag literal duplicated across files

**File:** `components/OnboardingGate.js:6` (`const FLAG = 'learnit_onboarded'`) vs `app/onboarding/page.js:275,294` (inline `'learnit_onboarded'`)
**Issue:** The flag string exists as a constant in one file and as inline literals in another. If one side is renamed/changed, the gate and the finish/skip CTAs silently disagree — users complete onboarding and get redirected back.
**Fix:** Export the constant from a shared module (see WR-02 snippet) and import it in both places.

### IN-03: Home page "Finance" card links to a guaranteed 404

**File:** `app/(dashboard)/page.js:121-127`
**Issue:** The hardcoded Finance card links to `/subjects`, but "Finance" is not in `SUBJECTS` (`lib/store.js:5-75`), so the subject API returns 404 and the client renders the "Nothing here" screen. The not-found page handles it gracefully and the tile text ("needs 2 more sources") suggests it is an intentional placeholder — flagging so it is a conscious choice rather than an oversight.
**Fix:** If unintentional, link to `/subjects` instead; if intentional, no change needed.

### IN-04: Unchecked status lookup in print page stage rendering

**File:** `app/pathway/[subjectId]/print/page.js:40-43`
**Issue:** `const style = DOT_STYLE[stage.status]` assumes every status is `done`/`active`/`locked`; an unknown status from the store would make `style` `undefined` and `style.color` would throw during server rendering. Safe with current seeded data, fragile if statuses evolve.
**Fix:** `const style = DOT_STYLE[stage.status] ?? { color: '#c3c0d2', mark: '○' }`

### IN-05: Dead fallback after loading guard

**File:** `app/(dashboard)/subjects/page.js:22`
**Issue:** `{subjects?.length ?? 0}` — line 14 already returns early when `subjects` is falsy, so the optional chain and `?? 0` are unreachable. Harmless, but misleading (implies the list may still be loading here).
**Fix:** Use `{subjects.length}` directly.

### IN-06: Onboarding gate redirects after hydration — gated content flashes briefly

**File:** `components/OnboardingGate.js:12-19`
**Issue:** The gate is a client effect; server-rendered HTML for any route paints first, then `router.replace('/onboarding')` fires post-hydration. First-visit users briefly see the dashboard before being redirected. Acceptable for this prototype phase (the gate mechanism itself is a deliberate decision), but the bundled docs describe the mitigation pattern (`node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md`).
**Fix (when desired):** Set a flag/attribute via an inline pre-hydration script and hide gated content before React mounts, per the guide above.

---

_Reviewed: 2026-08-14T18:03:50Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: standard_

## Post-Review Fixes Applied

Applied 2026-08-15. Scope: CR-01, WR-01, WR-02 only. Info-level findings untouched. Nothing committed.

### CR-01 — Stale stage-reorder state crashes page when switching subjects

**File:** `app/(dashboard)/pathway/[subjectId]/page.js`
**Change:** Replaced the single `useState(null)` permutation with a per-subject map (`useState({})` → `orders`), per the report's suggested fix. `activeOrder` is now derived as `orders[subject.id] ?? subject.stages.map((_, i) => i)`, and `moveStage` writes via `setOrders((prev) => ({ ...prev, [subject.id]: next }))`. Reorder interactions and visuals for the same subject are unchanged (a subject's custom order is even retained when returning to it); every other subject gets identity order, so a stale permutation can never index past a shorter subject's `stages`. Verified against the bundled docs: only `template.js` segments remount on dynamic-param change (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/template.md`), so the page does keep state across subject-chip navigation — keying by subject id is the correct scope.
**Verification:** `npm run build` exit 0. Runtime: dev server on PORT=3127 (SSR of `/pathway/AI%20Agents`, `/pathway/Distribution`, `/subjects` all 200). Interactive browser tooling was unavailable in this session, so the exact reorder → switch-subject sequence was driven against the live API data (`/api/subjects`, stage counts 4/3/2) replicating the component's derivation verbatim: pre-fix logic reproduces `TypeError: Cannot read properties of undefined (reading 'status')` after reordering AI Agents then switching to Distribution; post-fix logic shows Distribution with identity order `[0,1,2]` (3 stages, no `undefined` slots), Sales `[0,1]` (2 stages), and returning to AI Agents retains its `[1,0,2,3]` permutation with correct done counts (2/4), counts stable under permutation for all subjects. Dev server killed after verification.

### WR-01 — No error branch for failed queries

**Files:** `app/(dashboard)/subjects/page.js`, `app/(dashboard)/pathway/[subjectId]/page.js`, `app/(dashboard)/subjects/[subjectId]/page.js`
**Change:** All three pages now destructure `isError`/`refetch` from `useQuery` and render the same minimal inline-styled error line before the loading fallback (reachable because `data` stays `undefined` while `isError` is set): "Couldn't load — check the pipeline." in `#c2451a` with a dark pill Retry span calling `refetch()`, matching existing button idioms. `fetchSubjects` in the two edited files also gained `if (!res.ok) throw` so 500 responses actually reject into the error branch (the detail page's `fetchSubject` already threw on non-404). The 404/`notFound()` paths are untouched: pathway keeps `if (!name || (subjects && !subject)) notFound()` (skipped when the query errored since `subjects` is undefined), detail keeps `if (!name || subject === null) notFound()`.
**Verification:** `npm run build` exit 0; pages render 200 on the dev server with no behavior change on the happy path.

### WR-02 — Unguarded `localStorage` access

**Files:** `components/OnboardingGate.js`, `app/onboarding/page.js`
**Change:** `OnboardingGate` reads the flag through a `readFlag()` helper (`try { return window.localStorage.getItem(FLAG) } catch { return null }`) — on read failure the gate treats the user as not-onboarded and still routes to `/onboarding`. The onboarding page gained a `writeFlag()` helper (`try { localStorage.setItem(ONBOARDED_FLAG, '1') } catch {}`) used by both the "Skip setup →" and "Finish setup" CTAs — on write failure the Link still navigates to `/`, so no redirect ping-pong. Flag key stays `learnit_onboarded` in both files. (Shared-module extraction is IN-01/IN-02 territory and was deliberately not done.)
**Verification:** `npm run build` exit 0; gate logic unchanged on the happy path (read returns the stored value, write stores `'1'`).

---
_Post-review fixes applied: 2026-08-15 — CR-01, WR-01, WR-02 resolved; build exit 0; nothing committed_
