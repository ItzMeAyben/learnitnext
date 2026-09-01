# Roadmap: LearnIt

## Overview

LearnIt is the web app for the *Build Your Own Coursera* spec (`.planning/SPEC-Build-Your-Own-Coursera.md`):
save links from anywhere → one library table → overnight pipeline (fetch →
sort → build) → per-subject course material → digest. The Next.js 16 UI is
already design-complete as a mock over an in-memory store. The roadmap turns
it into a working product: first the user flow (screens connected,
navigation real), then the design layer (landing page, dashboard, responsive,
welcoming UX), then live data, then capture interactions, then pipeline
semantics.

## Phases

- [x] **Phase 1: Connect the Screens (App Flow)** - Working navigation end-to-end: onboarding gate, subjects index, study loop, no dead links (completed 2026-08-14)
- [ ] **Phase 2: UI Design & Responsive Overhaul** - Landing page, welcoming dashboard, responsive on every screen, consistent friendly visual system
- [ ] **Phase 3: Live Data Wiring** - Screens read real store data (subject sources, quiz per subject, pipeline counts, home widgets)
- [ ] **Phase 4: Capture & Interactions** - Save-a-link flow, Run now everywhere, search/export, retry
- [ ] **Phase 5: Pipeline Semantics** - Status-ladder transitions, failure states, real run log

## Phase Details

### Phase 1: Connect the Screens (App Flow)
**Goal**: A user can arrive cold, complete onboarding, and travel the entire
loop — Today → Subjects → subject material → pathway/quiz/listen — with every
navigation control working and no orphan screens.
**Depends on**: Nothing (first phase)
**Requirements**: FLOW-01, FLOW-02, FLOW-03, FLOW-04, FLOW-05, FLOW-06
**Status**: READY TO EXECUTE
**Success Criteria** (what must be TRUE):
1. A fresh browser profile lands on onboarding, not Today
2. Completing or skipping onboarding lands on Today; revisiting goes straight to Today
3. Onboarding Back/Continue advance through all steps (no frozen step 3)
4. TopNav reaches Today, a subjects index (all subjects listed), Listen, Library, Pipeline
5. From any subject: pathway opens ("Continue where you left off"), quiz starts for that subject, listening starts for that subject, and quiz/listen exits return to that subject
6. Zero navigation-labeled dead spans remain on Home, Library, Pipeline, Listen, Session
7. Unknown subject/pathway IDs show not-found (never a silent AI Agents fallback)
**Plans**: 5 plans
Plans:
- [x] 01-01-PLAN.md — First-run gate (localStorage + root layout) and navigable 5-step onboarding wizard (wave 1)
- [x] 01-02-PLAN.md — Atomic await-params fix + store fallback removal + server 404s + root not-found screen (wave 1)
- [x] 01-03-PLAN.md — TopNav five destinations, new /subjects index screen, Home dead spans, Session entry (wave 1)
- [x] 01-04-PLAN.md — Quiz/Listen/Session: ?subject= context in Suspense, context exits, dead spans (wave 1)
- [x] 01-05-PLAN.md — Subject + pathway loop hub: launchers, breadcrumbs, encoded hrefs, client 404s (wave 2, after 02)

### Phase 2: UI Design & Responsive Overhaul
**Goal**: The app welcomes users instead of annoying them — a landing page
introduces the product, the dashboard reads clearly with one obvious next
action, every screen works from phone to desktop widths, and one consistent
visual language makes the whole thing feel intentional.
**Depends on**: Phase 1 (design rebuilds on the now-working navigation)
**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05
**Status**: NOT STARTED
**Notes**: This is a frontend design phase — run `$gsd-discuss-phase 2` and
`$gsd-ui-phase 2` (UI-SPEC design contract) before `$gsd-plan-phase 2`.
**Success Criteria** (what must be TRUE):
1. A landing page presents the product and routes first-time visitors into
   onboarding and returning users into their dashboard
2. The dashboard (Today) welcomes the user with a clear hero and a single
   obvious next action — not a wall of equally-weighted widgets
3. Every screen is usable at 360px phone width through tablet to desktop —
   no horizontal scroll, no clipped or overlapping content
4. Onboarding, empty/loading/error states read friendly and guided — no
   jarring redirect flash on cold start, no dead-end copy
5. One visual system (type scale, spacing, color, component idioms) is
   applied consistently across all screens, including 404 and print views
**Plans:** 11/12 plans executed

Plans:
- [x] 02-01-PLAN.md — Design-token foundation: globals.css :root + class layer, lib/tokens.js mirror/factories/hooks, shared viewport-check script (wave 1)
- [x] 02-02-PLAN.md — Adaptive `/`: cookie-read server page, Server Action write, OnboardingGate retired, AppShell extracted, D-02 landing page (wave 2)
- [x] 02-03-PLAN.md — Subjects index + subject detail responsive + §9.5 sources cards + tone states (wave 3)
- [x] 02-04-PLAN.md — Pathway responsive (compact timeline, Move up/down, snap chips) + print sheet joins the system (wave 3)
- [x] 02-05-PLAN.md — Quiz responsive + button semantics + 404 joins the system (wave 3)
- [x] 02-06-PLAN.md — Library responsive: stats/filter reflow, table→§9.5 stacked cards on phone, §8 empty state (wave 3)
- [x] 02-07-PLAN.md — Pipeline responsive: steps/ladder/run-log reflow + tone states, Run-all preserved (wave 3)
- [x] 02-08-PLAN.md — Navigation shell: responsive TopNav, phone TabBar + PhoneHeader, AppShell skip-link/main/TabBar (wave 3)
- [x] 02-09-PLAN.md — Today redesign (D-03 hierarchy, one primary action) + LEARNER_NAME single source (wave 3)
- [x] 02-10-PLAN.md — Onboarding guided redesign (progress indicator, semantic controls) + FLOW-02 fence (wave 3)
- [x] 02-11-PLAN.md — Listen + Session responsive (pane stacking, rail→TabBar, §7.5 palette tokens, name unification) (wave 4)
- [ ] 02-12-PLAN.md — Phase 1 regression fence (FLOW-01..06) + full viewport sweep + human UAT gate (wave 5)

### Phase 3: Live Data Wiring
**Goal**: Every screen renders from the store/API instead of hardcoded arrays.
**Depends on**: Phase 2
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04
**Status**: NOT STARTED
**Success Criteria**:
1. Subject detail lists that subject's real sources
2. Quiz questions come from the API for the selected subject
3. Pipeline funnel/ladder counts match library row statuses
4. Home fresh-material/streak/run widgets read live data

### Phase 4: Capture & Interactions
**Goal**: The user can act, not just navigate.
**Depends on**: Phase 3
**Requirements**: CAPT-01, CAPT-02, CAPT-03
**Status**: NOT STARTED
**Success Criteria**:
1. Save-a-link POSTs to /api/webhook and the row appears in Library
2. Home Run now runs the pipeline
3. Library search/export and pipeline retry work

### Phase 5: Pipeline Semantics
**Goal**: Running the pipeline behaves like the spec's status ladder.
**Depends on**: Phase 4
**Requirements**: PIPE-01, PIPE-02
**Status**: NOT STARTED
**Success Criteria**:
1. Rows advance new → fetched → sorted → done; failures land in failed with error text
2. Run log shows real outcomes; failed rows can be retried
