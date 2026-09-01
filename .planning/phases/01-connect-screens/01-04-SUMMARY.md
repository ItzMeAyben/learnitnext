---
phase: 01-connect-screens
plan: 04
subsystem: ui
tags: [nextjs, app-router, use-search-params, suspense, navigation, next-link]

# Dependency graph
requires:
  - phase: 01-connect-screens (plans 01-03)
    provides: OnboardingGate + root layout, /subjects index + encoded subject routes, TopNav five-destination nav, 404 handling
provides:
  - "/quiz and /listen accept ?subject= context (Suspense-wrapped useSearchParams) with context-free defaults intact"
  - "Context-derived exits: quiz Exit -> /subjects/{subject} (or /subjects index when context-free); listen 'Read instead' -> /subjects/{subject} directly (D-08)"
  - "Quiz 'Next question' advances the in-page question counter (4..12) and resets the pick"
  - "Listen sidebar (Today/Subjects/Library/Pipeline) and 'Quiz me after' are working Links carrying subject context"
  - "Session rail icons, both hero CTAs, and both 'Waiting on you' rows are working Links with encoded hrefs"
  - "Last unencoded /subjects/AI Agents href eliminated (quiz Exit)"
affects: [01-05 (subject/pathway dead-span conversions reuse the same context-link pattern), Phase 2 DATA-02 (per-subject quiz content replaces static QUIZ_ITEMS display)]

# Tech tracking
tech-stack:
  added: []  # zero new dependencies — next/link + next/navigation only
  patterns:
    - "Page wrapper pattern: default export renders <Suspense fallback={null}><XScreen /></Suspense>; only the inner component calls useSearchParams (production-build gate)"
    - "Ternary href constants: backHref/playHref built as `subject ? `/dest/${encodeURIComponent(subject)}` : '/dest'` — no ?? fallbacks inside href template strings, keeping raw subject names out of href attributes"

key-files:
  created: []
  modified:
    - app/(dashboard)/quiz/page.js
    - app/listen/page.js
    - app/session/page.js

key-decisions:
  - "Quiz ♪ Play href built via ternary const (subject ? /listen?subject={encoded} : /listen?subject=AI%20Agents) instead of the plan's inline `?? 'AI Agents'` template — identical rendered hrefs, and keeps href attributes free of raw subject names"
  - "Listen sidebar 'Listen' row stays a span — it is the current-screen active indicator, not dead navigation"
  - "Session rail mapping per research inventory: ▤ /subjects, ♪ /listen, ? /quiz, ◍ /pathway/AI%20Agents (matches the hero continue-studying target)"
  - "Session rename row navigates to /subjects (the rename ACTION itself is D-05 out-of-scope); paywalled row navigates to /library"
  - "Player transport controls (1.5×, ⟲15, ❚❚, 30⟳, ⇥) and 'Save to highlights' left as spans (AUDIO-01 / actions, not navigation)"

patterns-established:
  - "Pattern: query-param subject context via Suspense-wrapped useSearchParams with null-safe defaults (quiz/listen; reusable for any future context-carrying screen)"
  - "Pattern: dead span -> Link with byte-identical inline styles + textDecoration:'none' (D-11 pixel-identical rendering)"

requirements-completed: [FLOW-04, FLOW-05]  # FLOW-05 Listen+Session half (Home/Library/Pipeline half completed in 01-03); FLOW-06 encoding half completed here

# Metrics
duration: 8 min
completed: 2026-08-14
---

# Phase 01 Plan 04: Study Screens Subject Context + Dead-Control Wiring Summary

**Quiz/Listen now read `?subject=` via Suspense-wrapped useSearchParams with context-derived encoded exits, quiz Next-question advances in-page, and every navigation-labeled dead span on Listen and Session is a working Link**

## Performance

- **Duration:** ~8 min (2026-08-14T17:35:22Z → 17:42:14Z UTC, plus summary)
- **Started:** 2026-08-14T17:35:22Z
- **Completed:** 2026-08-14T17:42:14Z
- **Tasks:** 3/3
- **Files modified:** 3

## Accomplishments
- Quiz carries subject context: breadcrumb shows the launching subject (default AI Agents), Exit returns to `/subjects/{encoded subject}` or the `/subjects` index when context-free — replacing the broken unencoded `/subjects/AI Agents` href; ♪ Play hops to listen with the subject preserved
- Quiz "Next question" is no longer dead: advances the counter 4→12 (clamped) and resets the picked answer, matching Skip's reset behavior; quiz content stays static (Phase 2 DATA-02 scope fence respected)
- Listen honors `?subject=` in the episode card (word-split render preserves the two-line look for multi-word names), its sidebar reaches Today/Subjects/Library/Pipeline, "Read instead" returns directly to the launching subject's page (D-08 one-hop), and "Quiz me after" carries the subject
- Session's four rail icons (▤ ♪ ? ◍), both hero CTAs (Continue reading / ♪ Listen instead), and both "Waiting on you" rows navigate with encoded hrefs; action controls (Search everything, Save a link) and the dashed Finance tile remain untouched

## Task Commits

Per-task commits were **skipped (commit_docs=false)** — project config disables commits (learnit is untracked in the shared parent monorepo); all changes are left uncommitted in the working tree as instructed.

1. **Task 1: Quiz — subject context, context-derived Exit, advancing Next question** — not committed (commit_docs=false)
2. **Task 2: Listen — subject context, sidebar links, Read instead / Quiz me after targets** — not committed (commit_docs=false)
3. **Task 3: Session — rail icons, hero CTAs, Waiting-on-you rows become Links** — not committed (commit_docs=false)

## Files Created/Modified
- `app/(dashboard)/quiz/page.js` — Suspense wrapper + QuizScreen; `?subject=` context; backHref/playHref encoded exits; qIndex state advancing Next question
- `app/listen/page.js` — Suspense wrapper + ListenScreen; `?subject=` episode card; sidebar spans → Links; Read instead → subject page; Quiz me after → `/quiz?subject=`
- `app/session/page.js` — rail icons → Links (subjects/listen/quiz/pathway); hero CTAs → encoded Links; Waiting-on-you rows → Links (subjects/library)

## Decisions Made
- Extracted quiz `backHref`/`playHref` as ternary constants rather than the plan's inline `?? 'AI Agents'` href template — see Deviations #1
- Session rail ◍ mapped to `/pathway/AI%20Agents` (research-inventory mapping, matching the hero card's continue-studying target)
- Kept `QUESTION_INDEX = 4` as the `useState` initializer (const retained per plan; JSX reads `qIndex` only)

## Deviations from Plan

### Auto-fixed Issues

**1. [Implementation-shape adjustment, no rule triggered] Quiz ♪ Play href built as a ternary constant instead of the inline `?? 'AI Agents'` template**
- **Found during:** Task 1 (acceptance-criteria gate)
- **Issue:** The plan's action text specified `href={`/listen?subject=${encodeURIComponent(subject ?? 'AI Agents')}`}` inline, but the plan's own acceptance criteria require (a) no `AI Agents` text on any `href=` line and (b) >= 2 literal `encodeURIComponent(subject)` matches — the inline `??` form satisfies neither (the fallback text sits inside the href attribute and `encodeURIComponent(subject ??` breaks the required substring)
- **Fix:** `const playHref = subject ? `/listen?subject=${encodeURIComponent(subject)}` : '/listen?subject=AI%20Agents'` — rendered hrefs are byte-identical to the plan's intent (`encodeURIComponent('AI Agents') === 'AI%20Agents'`); Link uses `href={playHref}`
- **Files modified:** app/(dashboard)/quiz/page.js
- **Verification:** All Task 1 acceptance greps pass; rendered default Play href verified on dev server as `/listen?subject=AI%20Agents`
- **Committed in:** n/a (commit_docs=false)

**2. [Implementation-shape adjustment, no rule triggered] Two-variable searchParams read on quiz**
- **Found during:** Task 1 (acceptance-criteria gate)
- **Issue:** Plan action showed inline `useSearchParams().get('subject')`, but the criterion greps for the literal `searchParams.get('subject')`, which the inline chained form does not contain
- **Fix:** `const searchParams = useSearchParams()` then `const subject = searchParams.get('subject')` — exactly the canonical Pattern 3 from 01-RESEARCH.md; identical behavior
- **Files modified:** app/(dashboard)/quiz/page.js
- **Verification:** criterion grep matches; build passes
- **Committed in:** n/a (commit_docs=false)

---

**Total deviations:** 2 (both zero-behavior-change adjustments to satisfy the plan's own acceptance gates)
**Impact on plan:** None — rendered output identical to plan intent; all acceptance criteria pass.

## Issues Encountered
- Local `grep` is ugrep 7.5.0 and one verification run used a pattern with a stray trailing backtick — both produced false-negative grep results during Task 2 verification. Resolved by re-checking with `/usr/bin/grep` (BSD) and a corrected pattern; the underlying code was correct throughout (byte-verified via hexdump + node substring check). No code changes needed.
- Interactive browser walkthrough: browser automation is unavailable in this subagent context ("Browser is not available in subagent"). The plan's dev walkthrough was executed as HTTP-level checks against a dev server on PORT=3125 (see Self-Check log): breadcrumb/episode-card subject rendering, all Link hrefs (quiz Exit, listen Read instead/Quiz me after/sidebar, session rail/CTAs/rows), context-free defaults, and zero unencoded-space hrefs all verified on rendered HTML. The Next-question click (counter 4→5 + pick reset) could not be clicked headlessly; it is verified by code (onClick wires `setQIndex((q) => (q < TOTAL_QUESTIONS ? q + 1 : q)); setPicked(null)`, header/progress read `qIndex`) — recommend one manual click during phase verification.

## User Setup Required
None - no external service configuration required.

## Known Stubs
None — no new stubs introduced. Quiz content remains static mock data (`QUIZ_ITEMS`) by design: per-subject quiz content is Phase 2 DATA-02, explicitly fenced out of this plan (research Pitfall 7). Listen episode eyebrow/description copy stays hardcoded (content, not navigation — D-11).

## Verification Log
- `npm run build` exits 0 (run after every task and once more at the end) — Suspense gate passed
- Task 1 criteria: Suspense count 3 (>=2); `searchParams.get('subject')` matches; `encodeURIComponent(subject)` count 2 (backHref + playHref); zero `AI Agents` on href= lines; `setQIndex((q) => (q < TOTAL_QUESTIONS ? q + 1 : q))` present; `QUESTION_INDEX` only at definition + useState initializer (no JSX reads); `QUIZ_ITEMS` import unchanged
- Task 2 criteria: Suspense count 3; `href={`/subjects/${encodeURIComponent(subject)}` inline (Read instead, D-08); `/quiz?subject=` present; exactly one sidebar span (Listen active indicator); transport controls untouched (block read)
- Task 3 criteria: all six hrefs grep-verified verbatim; rail block shows four `<Link` icons + unchanged ⌂; `href="/library"` count 1; "Save a link" still a span; zero unencoded `AI Agents` in href lines
- Plan-level: `grep -rn "AI Agents" app/ components/ | grep "href="` → no matches; no literal `"/subjects/AI Agents"` anywhere in app/
- Dev server (PORT=3125) rendered-HTML checks: `/quiz?subject=Distribution` → breadcrumb "Distribution", Exit href `/subjects/Distribution`, counter "Question 4 of 12"; `/quiz` default → breadcrumb "AI Agents", Exit `/subjects`, Play `/listen?subject=AI%20Agents`; `/listen?subject=Distribution` → card "Distribution", Read instead `/subjects/Distribution`, Quiz me after `/quiz?subject=Distribution`; `/listen` default → Read instead `/subjects/AI%20Agents`; `/session` → all six nav hrefs rendered; zero unencoded-space hrefs on all five tested URLs

## Next Phase Readiness
- FLOW-04 (context half) and the Listen/Session half of FLOW-05 are complete; FLOW-06's encoding half complete (the final unencoded site is gone)
- Ready for 01-05 (subject/pathway dead-span conversions), which can reuse the established ternary-href + Suspense patterns
- STATE.md / ROADMAP.md intentionally not updated by this executor (orchestrator-owned)

## Self-Check: PASSED

- Files: app/(dashboard)/quiz/page.js FOUND; app/listen/page.js FOUND; app/session/page.js FOUND
- Build: `npm run build` exit 0 (final run post-all-tasks)
- Commits: none expected — commit_docs=false (commits disabled; changes left uncommitted in working tree)
- All three tasks' acceptance criteria: PASS (logged above)

---
*Phase: 01-connect-screens*
*Completed: 2026-08-14*
