# Phase 1: Connect the Screens (App Flow) - Context

**Gathered:** 2026-08-14
**Status:** Ready for planning
**Source:** PRD Express Path (spec PDF + user request "work on the flow and connect the screens")

<domain>
## Phase Boundary

This phase delivers a fully navigable app: a user arriving cold completes
onboarding, lands on Today, and can travel the whole loop (Today → Subjects
→ subject → pathway / quiz / listen) with every navigation control working.
It wires navigation between existing screens. It does NOT add data-layer
realism, capture actions, pipeline logic, or any visual redesign.

</domain>

<decisions>
## Implementation Decisions

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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project planning
- `.planning/SPEC-Build-Your-Own-Coursera.md` — full spec extract (the PRD)
- `.planning/PROJECT.md` — project shape and stack constraints
- `.planning/REQUIREMENTS.md` — FLOW-01..06 define this phase

### Existing screens (the connective tissue)
- `app/onboarding/page.js` — entry wizard (frozen at step 3)
- `app/(dashboard)/page.js` — Today/home
- `app/(dashboard)/library/page.js`, `app/(dashboard)/pipeline/page.js` — table + monitor
- `app/(dashboard)/subjects/[subjectId]/page.js` — subject detail (hub of the study loop)
- `app/(dashboard)/pathway/[subjectId]/page.js`, `app/pathway/[subjectId]/print/page.js` — reading path
- `app/(dashboard)/quiz/page.js`, `app/listen/page.js`, `app/session/page.js` — study + alt screens
- `components/TopNav.js` — global nav (hardcoded Subjects target)
- `app/(dashboard)/layout.js` — route group that renders TopNav

### Data & server
- `lib/store.js` — in-memory store; `getSubjectById` silent fallback lives here
- `app/api/subjects/route.js`, `app/api/subjects/[subjectId]/route.js` — subject APIs
- `app/api/webhook/route.js` — capture receiver (NOT called this phase)

### Framework
- `AGENTS.md` — Next 16 breaking-changes warning; bundled docs at `node_modules/next/dist/docs/`

</canonical_refs>

<specifics>
## Specific Ideas

- Spec status ladder (p.2 of PDF): `new → fetched → sorted → done`, with
  `failed` + error text as the error branch — screens reference this
  vocabulary; keep labels consistent when linking (e.g., Library filter
  pills ↔ Pipeline funnel ↔ Today status dots).
- Spec setup order (pp.2-5): table → agent → ways to save (4 doors) →
  bridge → schedule = onboarding steps 1-5.
- The quiz screen's "Exit" link `/subjects/AI Agents` has an unencoded
  space — grep for `AI Agents` across app/ to catch every hardcoded
  subject link.
- `getSubjectById` falls back to `SUBJECTS[0]` (`lib/store.js:116`) —
  D-10 removes this fallback; check `app/api/subjects/[subjectId]/route.js`
  and the print page (server-side consumer) when changing it.

</specifics>

<deferred>
## Deferred Ideas

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

</deferred>

---

*Phase: 01-connect-screens*
*Context gathered: 2026-08-14 via PRD Express Path*
