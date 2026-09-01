# Requirements: LearnIt

**Defined:** 2026-08-14
**Core Value:** Save a link today, wake up to course material tomorrow — every screen in that loop reachable and one click away.

## v1 Requirements

### Screen Flow & Navigation (Phase 1 — this milestone)

- [ ] **FLOW-01**: First-time visitors are routed into onboarding; finishing or skipping it lands on Today (`/`), and returning visitors go straight to Today
- [ ] **FLOW-02**: The onboarding wizard is navigable — Back/Continue move through the setup steps and the final step completes into the app (no dead controls)
- [ ] **FLOW-03**: All primary destinations are reachable from the global nav — Today, Subjects, Listen, Library, Pipeline — and Subjects opens a subjects index screen listing all subjects (not a hardcoded `/subjects/AI Agents`)
- [ ] **FLOW-04**: The study loop is connected end-to-end — from a subject the user can open its pathway ("Continue where you left off"), start a quiz for that subject, and start listening for that subject; quiz and listen carry subject context and their exit/back controls return to that subject
- [ ] **FLOW-05**: Every navigation-labeled control on Home, Library, Pipeline, Listen, and Session is a working link — no dead spans (e.g., Home Finance tile and see-all links, Listen sidebar, Session rail and CTAs)
- [ ] **FLOW-06**: Invalid subject/pathway IDs render a not-found state instead of the silent AI Agents fallback, and hrefs containing dynamic segments are properly encoded (fix `/subjects/AI Agents`)

### UI Design & Responsiveness (Phase 2)

- [ ] **UI-01**: A landing page introduces the product and routes first-time visitors into onboarding and returning users into their dashboard
- [ ] **UI-02**: The dashboard (Today) welcomes the user with a clear hero and a single obvious next action instead of a wall of equally-weighted widgets
- [ ] **UI-03**: Every screen is usable from 360px phone width through tablet to desktop — no horizontal scroll, no clipped or overlapping content
- [ ] **UI-04**: Onboarding and all empty/loading/error states use friendly, guided copy — no jarring redirect flash on cold start, no dead-end states
- [ ] **UI-05**: One consistent visual system (type scale, spacing, color, component idioms) across every screen, including 404 and print views

### Live Data Wiring (Phase 3)

- [ ] **DATA-01**: Subject detail shows real per-subject sources from the store (no hardcoded SOURCE_ROWS)
- [ ] **DATA-02**: Quiz content is served per subject via API (no direct store import in client component)
- [ ] **DATA-03**: Pipeline funnel and ladder counts derive from library row statuses (no hardcoded 7/12/9/380/13)
- [ ] **DATA-04**: Home widgets (fresh material, streak, run summary) read live data

### Capture & Interactions (Phase 4)

- [ ] **CAPT-01**: "Save a link" opens a save flow that POSTs to `/api/webhook` and the row appears in Library
- [ ] **CAPT-02**: Home "Run now" triggers the pipeline run like the Pipeline screen does
- [ ] **CAPT-03**: Library search and CSV export work; pipeline Retry-all acts on failed rows

### Pipeline Semantics (Phase 5)

- [ ] **PIPE-01**: Running the pipeline advances rows through the status ladder (new → fetched → sorted → done) with failure states written to `error`
- [ ] **PIPE-02**: Run log reflects real step outcomes; failed rows are retryable

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

- **INTG-01**: Real capture doors (YouTube playlist feed, Telegram bot inbox, browser extension webhook)
- **INTG-02**: Real fetch/sort/build steps (transcript tools, subject grouping, Gemini Notebook bridge)
- **AUDIO-01**: Listen screen plays real audio behind the waveform

## Out of Scope

| Feature | Reason |
|---------|--------|
| Auth / multi-user | Personal single-user tool |
| Scheduling / cron | External to the app (spec step 7) |
| Visual redesign | Screens are design-complete; Phase 1 only wires navigation |
| Persistence beyond in-memory store | Mock store is the deliberate stand-in for the Baserow table |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FLOW-01 | Phase 1 | Pending human UAT (2 items) |
| FLOW-02 | Phase 1 | Pending human UAT (2 items) |
| FLOW-03 | Phase 1 | Pending human UAT (2 items) |
| FLOW-04 | Phase 1 | Pending human UAT (2 items) |
| FLOW-05 | Phase 1 | Pending human UAT (2 items) |
| FLOW-06 | Phase 1 | Pending human UAT (2 items) |
| UI-01..05 | Phase 2 | Pending |
| DATA-01..04 | Phase 3 | Pending |
| CAPT-01..03 | Phase 4 | Pending |
| PIPE-01..02 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 20 total
- Mapped to phases: 20
- Unmapped: 0

---
*Requirements defined: 2026-08-14*
*Last updated: 2026-08-14 after planning bootstrap from spec PDF*
