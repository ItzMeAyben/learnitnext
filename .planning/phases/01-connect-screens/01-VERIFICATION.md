---
phase: 01-connect-screens
verified: 2026-08-14T18:19:27Z
status: human_needed
score: 7/7 must-haves verified
overrides_applied: 0
human_verification:
  - test: "D-11 visual fidelity spot-check of converted controls"
    expected: "Every span-to-Link conversion (Finance tile, fresh-material cards, Listen sidebar, Session rail/CTAs/rows, subject launchers, pathway breadcrumbs/pills) renders pixel-identical to the pre-phase design — same fonts, colors, pill shapes, no link underlines, no layout shift."
    why_human: "Pixel-parity is a visual judgment; executors took screenshots + ran image analysis, but final D-11 fidelity sign-off is subjective and cannot be verified by grep or DOM checks alone."
  - test: "Subjective flow smoothness walkthrough (cold start)"
    expected: "Full cold loop feels continuous: fresh profile -> onboarding -> 5 steps -> Today -> Subjects -> subject -> pathway/quiz/listen -> back to subject, with no jarring flashes. Note: first-visit users briefly see SSR'd content before OnboardingGate redirects post-hydration (review finding IN-06, documented as acceptable for this phase)."
    why_human: "Perceived smoothness of the post-hydration gate redirect and scrollIntoView transitions is a UX-feel judgment requiring human eyes."
deferred:
  - truth: "Action controls (Save a link, Run now, Search transcripts, Export CSV, Rename, Rebuild material, Schedule, Copy log) perform real actions"
    addressed_in: "Phase 3"
    evidence: "ROADMAP Phase 3 goal 'The user can act, not just navigate' + CAPT-01/02/03 (save-a-link POST, Run now, search/export/retry). D-05 and ROADMAP criterion 6 deliberately scope Phase 1 to navigation-labeled controls only."
  - truth: "Screens render real per-subject data (SOURCE_ROWS mock, static QUIZ_ITEMS, streak/pipeline counts)"
    addressed_in: "Phase 2"
    evidence: "ROADMAP Phase 2 goal 'Every screen renders from the store/API instead of hardcoded arrays' + DATA-01..04; plan fences in 01-04 (Pitfall 7) and 01-05 explicitly exclude data-layer work."
---

# Phase 1: Connect the Screens (App Flow) Verification Report

**Phase Goal:** A user can arrive cold, complete onboarding, and travel the entire loop — Today → Subjects → subject material → pathway/quiz/listen — with every navigation control working and no orphan screens.
**Verified:** 2026-08-14T18:19:27Z
**Status:** human_needed (all automated checks passed; 2 human-only visual/UX items remain)
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

Roadmap success criteria (the phase contract), verified goal-backward against the codebase and a live dev server (PORT=3128) with a fresh headless-browser profile:

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Fresh browser profile lands on onboarding, not Today | ✓ VERIFIED | Runtime: fresh profile on `/` redirected to `http://localhost:3128/onboarding`; after `localStorage.removeItem('learnit_onboarded')`, `/library` also redirected to `/onboarding`. Gate covers every route (`app/layout.js:21` mounts `<OnboardingGate />` as first child of `<Providers>`), exempts `/onboarding` (`OnboardingGate.js:21`), uses `router.replace` inside `useEffect` — hydration-safe. |
| 2 | Completing/skipping onboarding lands on Today; revisits go straight to Today | ✓ VERIFIED | Runtime: clicked "Finish setup" at step 5 → landed on `/`, flag=`"1"`, Home content rendered. Cleared flag, re-entered wizard, clicked "Skip setup →" → landed on `/` with flag set. Revisit `/listen` with flag set stayed on `/listen` (no re-gate). Both exits are `<Link href="/" replace onClick={() => writeFlag()}>` (`app/onboarding/page.js:285,304`). |
| 3 | Onboarding Back/Continue advance through all steps (no frozen step 3) | ✓ VERIFIED | Runtime: walked 1→2→3 via Continue CTAs, Back 3→2, then 2→3→4→5; eyebrows `STEP 1..5 OF 5` observed live; "Finish setup" rendered at step 5. Code: `useState(1)` + `Math.max(1, s-1)` / `Math.min(5, s+1)` (`page.js:67,291,298`); both "Set up later" pills advance (`page.js:194,213`); no hardcoded `STEP 3 OF 5` remains. |
| 4 | TopNav reaches Today, subjects index (all subjects), Listen, Library, Pipeline | ✓ VERIFIED | `components/TopNav.js:6-12`: all five `to:` targets present (`/`, `/subjects`, `/listen`, `/library`, `/pipeline`); zero `AI Agents` remnants in TopNav. New `app/(dashboard)/subjects/page.js` exists (73 lines), fetches `/api/subjects` via useQuery, renders featured + row cards. Runtime: `GET /subjects` → 200 (SSR `Loading…` per client-fetch idiom; executors verified hydrated list shows AI Agents/Distribution/Sales). API returns all 3 subjects. |
| 5 | From any subject: pathway opens, quiz starts for that subject, listening starts for that subject, quiz/listen exits return to that subject | ✓ VERIFIED | `app/(dashboard)/subjects/[subjectId]/page.js`: Continue (127), Read again (142) → `/pathway/${encodeURIComponent(subject.id)}`; ♪ Listen (128) → `/listen?subject=…`; Retake (156) + Review misses (159) → `/quiz?subject=…` — 6 encoded launcher hrefs. Quiz Exit → `backHref` = `/subjects/${encodeURIComponent(subject)}` (quiz `page.js:26,49`); Listen "Read instead" → `/subjects/${encodeURIComponent(subject)}` (listen `page.js:122`). Runtime SSR: `/quiz?subject=Distribution` breadcrumb "Distribution", Exit href `/subjects/Distribution`, Play `/listen?subject=Distribution`; `/listen?subject=Distribution` → Read instead `/subjects/Distribution`, Quiz me after `/quiz?subject=Distribution`. 01-05 executor live-clicked the full loop (Continue→pathway→Switch to Listen→Retake→Exit→subject) in headless Chrome. |
| 6 | Zero navigation-labeled dead spans on Home, Library, Pipeline, Listen, Session | ✓ VERIFIED | Home: Finance tile is a `/subjects` Link (`(dashboard)/page.js:121`), all 4 FRESH_MATERIAL cards are Links (139), "Session view" Link (66); "Save a link"/"Run now" remain spans — D-05-excluded actions. Library: spans are table cells, sort headers (onClick), filter pills (onClick), and Search/Export/Save action pills — no nav labels. Pipeline: spans are Schedule ▾/Rename/Copy-log actions + working run control (onClick) — no nav labels. Listen: sidebar Today/Subjects/Library/Pipeline are Links (61-65); Listen row is the active indicator (correct); transport controls are player controls (AUDIO-01). Session: all 4 rail icons Links (24-27), both hero CTAs Links (55-56), both Waiting-on-you rows Links (81-88); Search/Save actions excluded. |
| 7 | Unknown subject/pathway IDs show not-found (never silent AI Agents fallback) | ✓ VERIFIED | Runtime: `/api/subjects/Nope` → 404 `{"error":"Subject not found"}`; `/api/subjects/%25` → 404; `/pathway/Nope/print` → 404; `/definitely-not-a-route` → 404 with "Nothing here" + `/subjects` link; browser: `/subjects/DoesNotExist` and `/pathway/DoesNotExist` render h1 "Nothing here" post-hydration (no AI Agents, no eternal Loading — pathway previously loaded forever). `grep -rn "SUBJECTS\[0\]" lib/ app/` → zero matches (fallback eradicated); client guards `if (!name || subject === null) notFound()` (subject:34) and `if (!name || (subjects && !subject)) notFound()` (pathway:49), both after all hooks. Zero unencoded `AI Agents` hrefs in `app/` + `components/`. |

**Score:** 7/7 truths verified

### Plan-Level Must-Have Truths (24 additional, all deduplicate into the 7 above)

All 24 plan frontmatter truths across 01-01…01-05 verified — 4 (gate/wizard), 5 (API 404 contract/print/not-found screen), 5 (nav skeleton), 6 (context/dead spans/encoding), 4 (loop hub/404s). Every claim in the SUMMARYs matched the code; the one documented acceptance-criterion deviation (`/api/subjects/%` returns framework 400 pre-route-match, not 404 — 01-02 Deviation 1) is a Next-level URL-parser behavior, satisfies the criterion's intent (never 500, never wrong data, `%25` → 404), and needs no override.

### Deferred Items

| # | Item | Addressed In | Evidence |
|---|------|-------------|----------|
| 1 | Action controls (Save a link, Run now, Search, Export, Rename, Rebuild, Schedule, Copy log) do not act | Phase 3 | ROADMAP Phase 3 goal + CAPT-01/02/03; D-05/criterion 6 scope navigation-labeled controls only |
| 2 | Per-subject real data (SOURCE_ROWS mock, static QUIZ_ITEMS, hardcoded counts) | Phase 2 | ROADMAP Phase 2 goal + DATA-01..04; explicit plan fences in 01-04/01-05 |

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `components/OnboardingGate.js` | First-visit gate in root layout | ✓ VERIFIED | 28 lines (≥12); guarded `readFlag()` in useEffect; `router.replace`; exempts `/onboarding` |
| `app/onboarding/page.js` | Navigable 5-step wizard with finish + skip | ✓ VERIFIED | 315 lines (≥150); `STEP_META`, Back/Continue bounds, writeFlag on both exits |
| `app/layout.js` | Mounts gate for every route | ✓ VERIFIED | `<OnboardingGate />` before `{children}` inside Providers (line 21) |
| `lib/store.js` | getSubjectById without silent fallback | ✓ VERIFIED | `SUBJECTS.find((s) => s.id === id)`; zero `SUBJECTS[0]` anywhere |
| `app/api/subjects/[subjectId]/route.js` | await params + 404 | ✓ VERIFIED | `await params`, try/catch decode → 404 JSON, missing → 404 JSON |
| `app/pathway/[subjectId]/print/page.js` | await params + notFound + back link | ✓ VERIFIED | async server component, safe decode, `notFound()`, encoded "← Back to pathway" link |
| `app/not-found.js` | Root not-found UI | ✓ VERIFIED | 19 lines (≥10); server component; links to `/` and `/subjects`; rendered for unmatched URLs (runtime-confirmed) |
| `components/TopNav.js` | Five working destinations | ✓ VERIFIED | Subjects tab `to: '/subjects'`; all five routes present; no hardcoded subject hrefs |
| `app/(dashboard)/subjects/page.js` | Subjects index screen | ✓ VERIFIED | 73 lines (≥40); useQuery → `/api/subjects`; isError/Retry branch (WR-01 fix); encoded detail hrefs |
| `app/(dashboard)/page.js` | Home: Finance tile link, fresh-material links, session entry | ✓ VERIFIED | Finance → `/subjects` Link; 4 FRESH_MATERIAL hrefs; `href="/session"` Session view pill |
| `app/(dashboard)/quiz/page.js` | ?subject= context, derived Exit, advancing questions | ✓ VERIFIED | Suspense + useSearchParams; backHref/playHref ternaries; `setQIndex` advances + resets pick |
| `app/listen/page.js` | ?subject= context + sidebar/secondary links | ✓ VERIFIED | Suspense + useSearchParams; sidebar Links; Read instead → subject page; Quiz me after carries context |
| `app/session/page.js` | Rail/CTA/row Links | ✓ VERIFIED | 4 rail icon Links, 2 hero CTA Links, 2 waiting-row Links, all encoded |
| `app/(dashboard)/subjects/[subjectId]/page.js` | Subject hub: launchers, breadcrumb, 404 | ✓ VERIFIED | 6 encoded launcher Links; breadcrumb → `/subjects`; null-on-404 queryFn + render-path notFound() |
| `app/(dashboard)/pathway/[subjectId]/page.js` | Pathway: breadcrumbs, encoded hrefs, listen hop, 404 | ✓ VERIFIED | breadcrumbs to index + subject; print/chips encoded; Switch to Listen; `#active-stage` scroll ×3; list-resolved notFound(); per-subject reorder map (CR-01 fix) |

### Key Link Verification

| From | To | Via | Status |
|------|----|----|--------|
| `app/layout.js` | `/onboarding` | OnboardingGate useEffect + router.replace when flag absent | ✓ WIRED |
| `app/onboarding/page.js` | `/` | Finish/Skip Links set flag (writeFlag) with replace | ✓ WIRED |
| `app/api/subjects/[subjectId]/route.js` | `lib/store.js getSubjectById` | await params → decode → lookup → 404 when missing | ✓ WIRED |
| `app/pathway/[subjectId]/print/page.js` | `app/not-found.js` | notFound() throw when subject missing | ✓ WIRED (HTTP 404 runtime-confirmed) |
| `components/TopNav.js` | `/subjects` index | Subjects tab href | ✓ WIRED |
| `app/(dashboard)/subjects/page.js` | `/api/subjects` | useQuery fetchSubjects (+ res.ok throw) | ✓ WIRED |
| `app/(dashboard)/subjects/page.js` | subject detail pages | per-subject Link with encodeURIComponent | ✓ WIRED |
| `app/(dashboard)/quiz/page.js` | subject page | Exit Link from ?subject= (backHref ternary) | ✓ WIRED |
| `app/listen/page.js` | `/`, `/subjects`, `/library`, `/pipeline` | sidebar Links | ✓ WIRED |
| `app/listen/page.js` | subject page / quiz | Read instead / Quiz me after with encoded subject | ✓ WIRED |
| `app/session/page.js` | `/subjects`, `/listen`, `/quiz`, `/pathway/AI%20Agents`, `/listen?subject=…`, `/library` | rail + CTAs + rows as Links | ✓ WIRED (all 7 hrefs in runtime SSR HTML) |
| `app/(dashboard)/subjects/[subjectId]/page.js` | pathway / listen / quiz | 6 launcher Links with `encodeURIComponent(subject.id)` | ✓ WIRED |
| `app/(dashboard)/subjects/[subjectId]/page.js` | `app/not-found.js` | fetchSubject 404 → null → notFound() in render | ✓ WIRED (browser-confirmed "Nothing here") |
| `app/(dashboard)/pathway/[subjectId]/page.js` | `/listen?subject={id}` | Switch to Listen Link | ✓ WIRED |
| `app/(dashboard)/pathway/[subjectId]/page.js` | subject page / index | breadcrumb Links (encoded) | ✓ WIRED |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `app/(dashboard)/subjects/page.js` | `subjects` (useQuery) | `GET /api/subjects` → `getSubjects()` → SUBJECTS (3 records) | Yes | ✓ FLOWING |
| `app/(dashboard)/subjects/[subjectId]/page.js` | `subject` (useQuery) | `GET /api/subjects/[id]` → store lookup, 404→null | Yes | ✓ FLOWING |
| `app/(dashboard)/pathway/[subjectId]/page.js` | `subjects` (useQuery) | `GET /api/subjects` → find by decoded id | Yes | ✓ FLOWING |
| `app/(dashboard)/page.js` | `subjects`/`library`/`pipeline` | three useQuery fetches to live API routes | Yes (mock store data — Phase 2 replaces content, not wiring) | ✓ FLOWING |
| `app/session/page.js` | `subjects` (useQuery) | `GET /api/subjects` (shelf tiles) | Yes | ✓ FLOWING |
| `app/(dashboard)/quiz/page.js` | `subject` (URL param) | useSearchParams; content static QUIZ_ITEMS by DATA-02 fence | N/A (navigation context only this phase) | ✓ FLOWING |

### Behavioral Spot-Checks

All run by verifier against dev server (PORT=3128) unless noted; dev server stopped afterward.

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| API resolves real id | `curl /api/subjects/Distribution` | `"id":"Distribution"` | ✓ PASS |
| API 404 unknown id | `curl /api/subjects/Nope` | 404 + `{"error":"Subject not found"}` | ✓ PASS |
| API 404 malformed id | `curl /api/subjects/%25` | 404 | ✓ PASS |
| Print page known id | `curl /pathway/Distribution/print` | 200 + `<h1>Distribution</h1>` + back link | ✓ PASS |
| Print page unknown id | `curl /pathway/Nope/print` | 404 | ✓ PASS |
| Unmatched URL | `curl /definitely-not-a-route` | 404 + "Nothing here" + `/subjects` link | ✓ PASS |
| Fresh profile gate (any route) | headless browser `/`, `/library` | redirected to `/onboarding` | ✓ PASS |
| Wizard traversal | headless browser Continue×N / Back | steps 1→5 and Back observed; Finish setup at 5 | ✓ PASS |
| Finish setup → Today + flag | headless browser click | URL `/`, flag `"1"`, Home renders | ✓ PASS |
| Skip setup → Today + flag | headless browser click | URL `/`, flag `"1"` | ✓ PASS |
| Returning visitor stays | headless browser `/listen` with flag | stays on `/listen` | ✓ PASS |
| Client 404 subject | headless browser `/subjects/DoesNotExist` | h1 "Nothing here", no AI Agents | ✓ PASS |
| Client 404 pathway | headless browser `/pathway/DoesNotExist` | h1 "Nothing here", no eternal Loading | ✓ PASS |
| Quiz context SSR | `curl "/quiz?subject=Distribution"` | breadcrumb Distribution; Exit `/subjects/Distribution`; Play `/listen?subject=Distribution` | ✓ PASS |
| Listen context SSR | `curl "/listen?subject=Distribution"` | Read instead `/subjects/Distribution`; Quiz me `/quiz?subject=Distribution` | ✓ PASS |
| Session nav SSR | `curl /session` | all 7 encoded nav hrefs present | ✓ PASS |
| No unencoded subject hrefs | `grep -rn 'AI Agents' app/ components/ \| grep href=` | zero matches | ✓ PASS |
| Production build | `npm run build` (orchestrator, post-fixes) | exit 0 | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| FLOW-01 | 01-01 | First-run routing to onboarding; finish/skip → Today; revisits → Today | ✓ SATISFIED | Runtime browser checks (criteria 1-2) |
| FLOW-02 | 01-01 | Wizard navigable, Back/Continue through all steps, no dead controls | ✓ SATISFIED | Runtime walk (criterion 3); Set-up-later pills + Verify live |
| FLOW-03 | 01-03 | All destinations from global nav; subjects index lists all subjects | ✓ SATISFIED | TopNav code + index page + 200 (criterion 4) |
| FLOW-04 | 01-04, 01-05 | Study loop end-to-end with subject context and exits back to subject | ✓ SATISFIED | Launcher/exit links verified in code + SSR + 01-05 live click-through (criterion 5) |
| FLOW-05 | 01-03, 01-04, 01-05 | No navigation-labeled dead spans on Home/Library/Pipeline/Listen/Session | ✓ SATISFIED | Full span audit (criterion 6); only D-05-excluded action controls remain |
| FLOW-06 | 01-02, 01-04, 01-05 | Not-found for invalid ids; encoded dynamic hrefs | ✓ SATISFIED | Runtime 404 matrix client+server; zero unencoded hrefs (criterion 7) |

Orphaned requirements: none — REQUIREMENTS.md maps exactly FLOW-01…FLOW-06 to Phase 1, all claimed by plans. Phase 2-4 IDs (DATA/CAPT/PIPE) are correctly unclaimed.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| Multiple (Home header, Library, Pipeline, Session, subject page) | — | Dead action spans (Save a link, Run now, Search, Export, Rename, Rebuild, Schedule, Copy log) | ℹ️ Info | Intentional per D-05 exclusion + ROADMAP criterion 6 wording; Phase 3 (CAPT-*) |
| Subject page, quiz, listen, home widgets | — | Hardcoded mock data (SOURCE_ROWS, QUIZ_ITEMS, streak 37, run counts) | ℹ️ Info | Intentional plan fences; Phase 2 (DATA-*) |
| `app/listen/page.js` | 17-21, 70-78 | "Up next" episode rows are non-link divs | ℹ️ Info | Not navigation-labeled (content list, outside D-05 offender inventory); candidate future enhancement |
| `app/(dashboard)/page.js` | 7-10 | `fetchSubjects` lacks `res.ok` throw (WR-01 fixed the other three pages); no error branch on Home | ℹ️ Info | Review IN-01 duplication note; happy path unaffected; Phase 2 data wiring touches these files anyway |
| `app/(dashboard)/subjects/page.js` | 31 | `subjects?.length ?? 0` unreachable after loading guard | ℹ️ Info | Review IN-05; harmless |
| `components/OnboardingGate.js` | 12-19 | Post-hydration redirect — gated content flashes briefly on first visit | ℹ️ Info | Review IN-06; documented as acceptable this phase; listed in human verification |

No TODO/FIXME/placeholder markers in any phase file. No blocker or warning-level stubs found.

### Human Verification Required

### 1. D-11 Visual Fidelity Spot-Check

**Test:** Open each converted control (Home Finance tile + fresh-material cards, Listen sidebar + secondary pills, Session rail/hero CTAs/waiting rows, subject launchers, pathway breadcrumbs + stage pills) side-by-side with the pre-phase design.
**Expected:** Pixel-identical rendering — same inline styles, pill shapes, colors; no link underlines; no layout shifts.
**Why human:** Pixel-parity is a visual judgment; executors' screenshot + image-analysis passes are suggestive, not conclusive.

### 2. Cold-Start Flow Smoothness

**Test:** In a fresh browser profile, run the full loop: onboarding (all 5 steps) → Today → Subjects → a subject → pathway → quiz → listen → back to subject.
**Expected:** Continuous flow with no dead ends; note whether the brief pre-redirect flash of SSR content on first visit (IN-06) is acceptable.
**Why human:** Subjective UX-feel judgment (redirect flash, smooth-scroll feel) cannot be measured by grep/DOM checks.

### Gaps Summary

No gaps. All 7 roadmap success criteria verified against the actual codebase and live runtime behavior — including a fresh-profile browser walkthrough of the onboarding gate, the full 5-step wizard with Finish and Skip, both client-side not-found surfaces, and a 404 matrix across API, print page, and unmatched URLs. All 15 phase artifacts exist, are substantive, wired, and carry live data. All 6 requirement IDs are satisfied with no orphans. Post-review fixes (CR-01 per-subject reorder state, WR-01 error branches, WR-02 guarded localStorage) are present in the code and build-verified. Remaining items are informational (deferred to Phases 2-3 by explicit scope) or human-only visual/UX sign-offs.

---
_Verified: 2026-08-14T18:19:27Z_
_Verifier: the agent (gsd-verifier)_
