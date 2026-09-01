# Phase 2: UI Design & Responsive Overhaul - Context

**Gathered:** 2026-08-15
**Status:** Ready for planning
**Source:** User design brief — "design the landing page, dashboard. and every aspect of the website we need to make it responsive also we need to welcome the users to our app not annoy them with the UI"

<domain>
## Phase Boundary

This phase delivers the design layer on top of Phase 1's working navigation:
an adaptive landing page at `/`, a welcoming redesigned dashboard, responsive
layouts on every screen from 360px phones to desktop, one consistent visual
system, and a UX tone pass (microcopy, empty/loading/error states, no jarring
flashes). It does NOT add data-layer realism (Phase 3), capture actions
(Phase 4), or pipeline semantics (Phase 5) — screens still render the current
store/mock data, just designed better.

</domain>

<decisions>
## Implementation Decisions

### Landing & Entry (locked)
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

### Dashboard (locked)
- **D-03**: Today is redesigned as a welcoming hub with clear hierarchy:
  (1) a greeting hero with a one-line overnight status, (2) ONE primary
  next action — "Continue where you left off" into the most recent subject's
  active pathway stage, (3) subjects grid, (4) quietly demoted secondary
  info (saved yesterday, pipeline health, streak as subtle reinforcement —
  not a wall of equally-weighted widgets). Learner name comes from a single
  source (end the Iven/Sam split).

### Responsive (locked)
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

### Visual System (locked)
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

### Welcoming UX Tone (locked)
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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning
- `.planning/ROADMAP.md` — Phase 2 goal + 5 success criteria
- `.planning/REQUIREMENTS.md` — UI-01..05
- `.planning/SPEC-Build-Your-Own-Coursera.md` — product story the landing tells (pp.1, 4-5, 10)

### Screens being designed (current state)
- `app/(dashboard)/page.js` — Today (becomes adaptive `/` + redesigned hub)
- `components/TopNav.js`, `app/(dashboard)/layout.js` — nav that must go responsive
- `app/onboarding/page.js`, `components/OnboardingGate.js` — entry flow being reshaped
- `app/(dashboard)/subjects/page.js`, `app/(dashboard)/subjects/[subjectId]/page.js`
- `app/(dashboard)/pathway/[subjectId]/page.js`, `app/pathway/[subjectId]/print/page.js`
- `app/(dashboard)/quiz/page.js`, `app/listen/page.js`, `app/session/page.js`
- `app/(dashboard)/library/page.js`, `app/(dashboard)/pipeline/page.js`
- `app/not-found.js`, `app/globals.css` (3-line reset — tokens land here), `lib/wave.js`

### Phase 1 contracts that must not regress
- `.planning/phases/01-connect-screens/01-VERIFICATION.md` — the flow truths
- `.planning/phases/01-connect-screens/01-REVIEW.md` — known info items (IN-06 flash is resolved by D-01)

### Framework
- `AGENTS.md` — Next 16 bundled docs at `node_modules/next/dist/docs/`

</canonical_refs>

<specifics>
## Specific Ideas

- Adaptive `/` kills two birds: landing page (UI-01) AND flash-free cold
  start (UI-04) — one route, rendered by readiness, no redirect.
- The dashboard's "one obvious next action" already has machinery: pathway
  stages have `active` state and Phase 1 wired "Continue where you left off"
  scrolling — the redesign promotes it to hero CTA.
- Library already uses @tanstack/react-table; responsive restack should
  keep the library (data logic) and change only presentation.
- Subjects tiles have `tileColor` — natural seed for token-izing accent colors.
- 360px is the acceptance width; test at 360, 390, 768, 1024, 1440.
- The existing screens are visually coherent already (dark navy, cream
  cards, mono accents) — extract and systematize, don't invent a new brand.

</specifics>

<deferred>
## Deferred Ideas

- Data realism for widgets (Phase 3: DATA-01..04)
- Capture actions (Phase 4: CAPT-01..03)
- Pipeline semantics (Phase 5: PIPE-01..02)
- Real integrations, audio playback, auth, scheduling (v2)
- Full dark mode across the app (Listen's toggle is the only dark surface today)

</deferred>

---

*Phase: 02-ui-design-responsive-overhaul*
*Context gathered: 2026-08-15 via user design brief (autonomous discuss, "just start")*
