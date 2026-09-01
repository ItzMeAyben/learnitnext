---
phase: 01-connect-screens
plan: 2
subsystem: api
tags: [nextjs, app-router, dynamic-routes, await-params, not-found, http-404, route-handlers]

# Dependency graph
requires:
  - phase: 01-connect-screens (Plan 01-01, onboarding gate)
    provides: Root layout with OnboardingGate; unrelated to this plan's files but same wave
provides:
  - "getSubjectById returns undefined for unknown ids (silent AI Agents fallback removed)"
  - "GET /api/subjects/[id]: await params + safe decode; 404 JSON error for unknown/malformed ids"
  - "/pathway/[id]/print: async server component with await params + notFound() + back-to-pathway link"
  - "Root app/not-found.js styled 404 screen covering unmatched URLs and boundary-less notFound() throws"
affects: [01-connect-screens Plan 05 (client not-found surfacing verifies against this API contract), Live Data Wiring]

# Tech tracking
tech-stack:
  added: []  # zero new dependencies — all APIs ship with next@16.3.1
  patterns:
    - "await params in every Next 16 server consumer (route handler + server page)"
    - "decodeURIComponent wrapped in try/catch -> 404 (never 500 on malformed input)"
    - "notFound() throw -> root not-found.js boundary (server pages)"
    - "NextResponse.json({ error }, { status: 404 }) for API 404 bodies"

key-files:
  created:
    - app/not-found.js
  modified:
    - lib/store.js
    - app/api/subjects/[subjectId]/route.js
    - app/pathway/[subjectId]/print/page.js

key-decisions:
  - "Store fallback removed exactly as planned; callers verified by grep first (only the two fixed consumers call getSubjectById)"
  - "Malformed ids that reach app code 404 via try/catch around decodeURIComponent; transport-level malformed URLs are left to Next's built-in 400 (see Deviation 1)"
  - "Root not-found.js only (no segment-level files, no experimental global-not-found.js)"

patterns-established:
  - "Pattern: server dynamic route = async fn, const { param } = await params, safe-decode, missing -> 404/notFound()"
  - "Pattern: deep print screens link back to their origin with encodeURIComponent hrefs (D-09)"

requirements-completed: [FLOW-06]

# Metrics
duration: 5min
completed: 2026-08-14
---

# Phase 1 Plan 2: Server Correctness (await params, 404s, not-found screen) Summary

**Atomic Next-16 fix: `await params` + real 404s in the subject API route and pathway print page, silent AI-Agents fallback removed from the store, and a styled root not-found screen for unmatched URLs**

## Performance

- **Duration:** 5 min
- **Started:** 2026-08-14T17:17:56Z
- **Completed:** 2026-08-14T17:22:41Z
- **Tasks:** 2
- **Files modified:** 4 (3 modified, 1 created)

## Accomplishments
- Real subject IDs resolve correctly on both server consumers for the first time since the Next 16 upgrade (`/api/subjects/Distribution` returns Distribution JSON; print page h1 renders "Distribution") — the sync-`params` bug is fixed with `await params`
- Unknown ids return real HTTP 404s: `/api/subjects/Nope` -> 404 `{"error":"Subject not found"}`; `/pathway/Nope/print` -> 404 styled not-found screen (was HTTP 200 + AI Agents content for both)
- The silent `?? SUBJECTS[0]` fallback is eradicated from `lib/store.js` (`grep -rn "SUBJECTS\[0\]" lib/ app/` returns nothing)
- Malformed percent-encodings that reach app code 404 instead of crashing: `/api/subjects/%25` -> 404 (decodeURIComponent URIError caught), same on `/pathway/%25/print`
- Print page gained a working "← Back to pathway" link with an encoded href (D-09)
- New `app/not-found.js` renders for unmatched URLs (`/definitely-not-a-route` -> 404 + "Nothing here") and for boundary-less `notFound()` throws, with links to `/` and `/subjects`

## Task Commits

Commits are disabled for this project (`commit_docs: false`; learnit is untracked inside the shared `yahshua` monorepo). All changes are left uncommitted in the working tree as instructed.

1. **Task 1: Atomic fix — await params, remove store fallback, 404s, back link** — commit skipped (commit_docs=false)
2. **Task 2: Create root not-found screen** — commit skipped (commit_docs=false)

## Files Created/Modified
- `lib/store.js` — `getSubjectById` now returns `SUBJECTS.find((s) => s.id === id)` (undefined for unknown ids); no other change
- `app/api/subjects/[subjectId]/route.js` — `await params`, try/catch decode -> 404, missing subject -> 404 JSON, else subject JSON
- `app/pathway/[subjectId]/print/page.js` — async server component, `await params`, safe decode + `notFound()`, missing subject -> `notFound()`, back-to-pathway Link above the white sheet; all existing print markup untouched
- `app/not-found.js` (NEW) — server-component 404 screen in the app's visual language (#f3f2f9 page, white card radius 24, #12121a headings, L mark), "Back to Today" + "Browse subjects" links

## Decisions Made
- Verified by grep before editing that only the two fixed files call `getSubjectById`, so the fallback removal could land atomically with no other callers to update
- Left transport-level malformed URLs (bare `%`) on Next's built-in 400 rather than adding a `proxy.js` interception layer — research explicitly discourages proxy, the plan does not include one, and the threat model's actual requirement (never 500, never wrong data) is met (see Deviation 1)
- Used the plan's exact JSX for `not-found.js` verbatim; root-level file only

## Deviations from Plan

### Documented Deviations

**1. [Acceptance criterion not satisfiable at app layer] `/api/subjects/%` returns framework 400, not 404**
- **Found during:** Task 1 verification (runtime matrix)
- **Issue:** The plan expects `curl /api/subjects/%` to output 404. In Next 16.3.1, a transport-level malformed percent sequence (bare `%`, `%E0%A4%A`) is rejected by Next's URL parser with **400 Bad Request before any route matching occurs** — the request never reaches the route handler, the page, or any `not-found.js` boundary (verified: response is a Next.js HTML error page with no application code executed).
- **Why not fixed:** No route-handler/page code can intercept a request that never matches a route. Converting the framework's 400 into a 404 would require a `proxy.js` layer, which the phase research explicitly discourages ("last resort") and the plan does not include — adding one would be a Rule 4 architectural change for no correctness gain.
- **Criterion intent IS satisfied:** threat T-02-01 ("404 on URIError, never an unhandled 500") targets the decode path that app code performs. The malformed id that actually reaches the handler — `%25`, which Next decodes to a literal `%` — returns **404** on both consumers via the plan-specified try/catch (verified with curl). Framework-rejected URLs get a 400 error page with no store contents and no 500.
- **Files modified:** none (code is exactly as the plan specifies)
- **Verification:** `curl -s -o /dev/null -w '%{http_code}' .../api/subjects/%25` -> 404; `.../pathway/%25/print` -> 404; bare `%` -> 400 (framework)

**2. [Procedural] Dev-server verification ran on port 3123, not 3000**
- **Detail:** Per coordinator instructions (non-3000 port). Port 3100 was first attempted but occupied by a local Docker container (EADDRINUSE); 3123 was free. All plan curl checks were run against `http://localhost:3123` with identical paths/expectations; the server was stopped after verification.

---

**Total deviations:** 1 acceptance-criterion deviation (documented, not code-fixable at app layer) + 1 procedural note
**Impact on plan:** All must-have truths hold: no code path returns SUBJECTS[0] for an unknown id; unknown and app-reachable malformed ids never 500 and never return wrong data. Only the literal bare-`%`-in-URL status differs (400 vs 404), at the framework layer.

## Issues Encountered
None beyond Deviation 1/2. `npm run build` passed on the first run after each task.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- FLOW-06 server half complete: the API contract (`404` + `{"error":"Subject not found"}`) that Plan 05's client-side not-found surfacing verifies against is now live
- Same-wave plans (03 subjects index, 04 navigation wiring) can link safely: unknown ids 404; `/subjects` target of the not-found screen links ships in Plan 03 (link target existing in final wave state is what matters, per plan note)
- Client subject detail page still fetches the API and will now get real 404s instead of AI Agents JSON — Plan 05 surfaces them in the UI

## Verification Log (plan-level `<verification>`)

- `npm run build` exits 0 (run twice: after Task 1 edits and after Task 2 file; both clean, `/_not-found` route present)
- Runtime matrix on dev server (port 3123):
  - known id: `/api/subjects/Distribution` -> 200 + `"id":"Distribution"`; `/api/subjects/Sales` -> 200 + `"id":"Sales"`; `/pathway/Distribution/print` -> 200, h1 "Distribution", no `>AI Agents<`, back link rendered with `href="/pathway/Distribution"`
  - unknown id: `/api/subjects/Nope` -> 404 `{"error":"Subject not found"}`; `/pathway/Nope/print` -> 404 styled screen
  - malformed id (app-reachable): `/api/subjects/%25` -> 404; `/pathway/%25/print` -> 404
  - malformed id (transport-level): `/api/subjects/%` -> 400 from Next's URL parser (Deviation 1)
  - unmatched URL: `/definitely-not-a-route` -> 404, body contains "Nothing here", `href="/"`, `href="/subjects"`
- `grep -rn "SUBJECTS\[0\]" lib/ app/` -> no matches

## Self-Check: PASSED

- Files exist on disk: `lib/store.js`, `app/api/subjects/[subjectId]/route.js`, `app/pathway/[subjectId]/print/page.js`, `app/not-found.js` — verified via `[ -f ]`
- Commits: none expected (commit_docs=false; all changes intentionally left uncommitted in the working tree)
- No modifications to STATE.md, ROADMAP.md, or other plans' files

---
*Phase: 01-connect-screens*
*Completed: 2026-08-14*
