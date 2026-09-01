---
phase: 02-ui-design-responsive-overhaul
plan: 12
verified: 2026-08-16T00:00:00Z
method: playwright-core (system Chrome, channel:'chrome') against `npm run dev -- --port 3199`
cookie_fixture: learnit_onboarded=1 injected via context.addCookies (onboarded state); omitted contexts = fresh un-onboarded visitor
flow_matrix: 45/45 checks PASS
sweep_cookie: ALL VIEWPORTS CLEAN (12 routes x 5 widths)
sweep_nocookie: ALL VIEWPORTS CLEAN (12 routes x 5 widths)
hygiene_greps: 7/7 empty
build: npm run build exit 0 (2026-08-16)
status: automated-half complete; awaiting Task 2 human UAT
---

# Phase 2 Plan 02-12: D-11 Regression Fence + Full Sweep — Verification Evidence

Record of Task 1 (the automated half of the phase's UAT gate). Everything below
is reproducible: dev server on port 3199, `npm i --no-save playwright-core`,
the commands cited per row. This file is the hand-off to `$gsd-verify-phase`.

## FLOW matrix (D-11 fence — Phase 1 truths re-proved against the redesigned app)

Amended per UI-SPEC §15 / D-01: FLOW-01's "routed into onboarding" is satisfied
by "fresh visitor at `/` sees the landing whose primary CTA enters
`/onboarding`" — the deep-route redirect is intentionally gone (rendered, not
redirected). All other truths unchanged.

| FLOW | Amended truth re-proved | Status | Evidence (URL + observed selector/click) |
|------|------------------------|--------|------------------------------------------|
| FLOW-01 | Fresh profile at `/` sees the LANDING; CTA enters `/onboarding`; Finish/Skip set `learnit_onboarded` and land on `/` rendering Today; revisit `/` stays Today | ✓ PASS (6/6) | Fresh ctx `GET /` → url `http://localhost:3199/`, navigatedUrls `["http://localhost:3199/"]` (no redirect anywhere), h1 "Save a link today. Wake up to course material tomorr…"; `a[href="/onboarding"]` text "Start setup" clicked → `/onboarding` eyebrow "STEP 1 OF 5"; Continue×4 → "STEP 5 OF 5"; "Finish setup" clicked → url `/`, h1 "Built while you slept, Iven", cookie `learnit_onboarded=1`; revisit `GET /` → h1 "Built while you slept, Iven" (stays Today) |
| FLOW-02 | Wizard walks 1→5 via Continue, Back clamps at 1, Set-up-later advances, Finish completes, Skip works from any step | ✓ PASS (5/5) | `/onboarding` fresh: "STEP 1 OF 5" + Back `disabled=true`; Continue → "STEP 2 OF 5"; Back → "STEP 1 OF 5" (disabled again — clamp); Continue×2 → step 3 doors; "Set up later" clicked → "STEP 4 OF 5"; "Skip setup →" clicked from step 4 → url `/`, cookie `learnit_onboarded=1`, h1 "Built while you slept, Iven". (Finish-walk covered in FLOW-01; 02-10 Task 2 re-confirmed) |
| FLOW-03 | Top tabs (≥768) and bottom bar (<768) both reach Today, Subjects (lists all 3), Listen, Library, Pipeline | ✓ PASS (12/12) | 1280w: `nav[aria-label="Primary"]` display≠none, links `[["Today","/"],["Subjects","/subjects"],["Listen","/listen"],["Library","/library"],["Pipeline","/pipeline"]]`; `/subjects` renders AI Agents/Distribution/Sales; each top tab clicked → url `/listen`, `/library`, `/pipeline`, `/` (each restart from `/subjects`, AppShell-bearing page). 360w: bottom `nav.tabbar` display≠none, same 5 hrefs; each bottom tab clicked → `/subjects`, `/listen`, `/library`, `/pipeline`, `/` |
| FLOW-04 | From a subject: pathway opens + "Continue where you left off" scrolls to the active stage; quiz starts with `?subject=`; listening starts with `?subject=`; quiz Exit and Listen "Read instead" return to that subject | ✓ PASS (7/7) | `/subjects` → clicked "Distribution" → `/subjects/Distribution`; "Continue" `href="/pathway/Distribution"` (encoded) clicked → `/pathway/Distribution` with `#active-stage` present (count=1, scroll anchor) and "Continue where you left off" visible; "Retake" → `/quiz?subject=Distribution`, Exit `href="/subjects/Distribution"`, clicked → back at `/subjects/Distribution`; "♪ Listen" → `/listen?subject=Distribution`, "Read instead" `href="/subjects/Distribution"`, clicked → back at `/subjects/Distribution` |
| FLOW-05 | Zero navigation-labeled dead spans — every nav-labeled control is a Link; remaining actions are honestly disabled buttons | ✓ PASS (3/3) | 1280w TopNav: 5/5 labels are `<a>`, 0 nav-labeled spans outside anchors; 360w TabBar: 5/5 labels are `<a>`, 0 nav-labeled spans outside anchors (label `<span>`s live INSIDE their anchors — content spans). DOM audit over 9 screens (`/`, `/subjects`, subject, pathway, quiz, listen, library, pipeline, session): `span[onclick]|span[role=link]|span[role=button]` = 0; `button[disabled]` = 29 (honestly disabled action pills). Static: `grep -rn "<span[^>]*onClick" app components` → empty |
| FLOW-06 | Unknown subject/pathway/print ids render 404 (client + server); every dynamic href uses encodeURIComponent | ✓ PASS (6/6) | `/subjects/DoesNotExist` → h1 "Nothing here"; `/pathway/DoesNotExist` → h1 "Nothing here"; `/nope` → h1 "Nothing here"; `GET /pathway/DoesNotExist/print` → HTTP 404; `GET /api/subjects/Nope` → 404 `{"error":"Subject not found"}`; `/subjects` AI Agents tile `href="/subjects/AI%20Agents"` (encoded); static greps for unencoded `href={'/subjects/' + …}` / template-literal hrefs without encodeURIComponent across subjects/pathway/quiz/listen prefixes → empty |

**Score: 6/6 truths — 45/45 individual checks PASS** (full transcript:
`/tmp/flow-0212.out`, runner `/tmp/flow-0212.mjs`).

## Viewport sweep (UI-03 full-route-list gate)

Route list (now the script DEFAULT): `/`, `/onboarding`, `/subjects`,
`/subjects/AI%20Agents`, `/pathway/AI%20Agents`, `/pathway/AI%20Agents/print`,
`/quiz?subject=AI%20Agents`, `/listen?subject=AI%20Agents`, `/library`,
`/pipeline`, `/session`, `/nope` — widths 360/390/768/1024/1440.

| Command | Verdict |
|---------|---------|
| `node scripts/check-viewports.mjs --port 3199` (cookie: `learnit_onboarded=1`) | **ALL VIEWPORTS CLEAN** (60 cells) |
| `node scripts/check-viewports.mjs --port 3199 --no-cookie --out /tmp/shots-nocookie` (un-onboarded, full route list) | **ALL VIEWPORTS CLEAN** (60 cells) |

No-cookie `/` renders the landing (not a redirect) and `/onboarding` renders
the wizard — asserted in the FLOW-01/FLOW-02 rows above. Screenshots:
`/tmp/shots/` (cookie state) and `/tmp/shots-nocookie/`.

## Static hygiene fences (grep)

| # | Fence | Command | Result |
|---|-------|---------|--------|
| 1 | No OnboardingGate / deep-route redirect remnants | `grep -rn "OnboardingGate\|router.replace('/onboarding')" app components` | empty — PASS |
| 2 | No dangerouslySetInnerHTML | `grep -rn "dangerouslySetInnerHTML" app components lib` | empty — PASS |
| 3 | No `outline: none` | `grep -rn "outline: none\|outline:none" app` | empty — PASS |
| 4 | No unencoded dynamic hrefs | `grep -rn "href={'/subjects/' + \|href={\`/subjects/\${" app components \| grep -v encodeURIComponent` (same for pathway/quiz/listen) | empty — PASS |
| 5 | No hardcoded unencoded ids | `grep -rn "'/subjects/AI Agents'\|\"/subjects/AI Agents\"" app components` | empty — PASS |
| 6 | One h1 per screen | playwright `document.querySelectorAll('h1').length` — 12 routes × 360w and 1280w, cookie state: **all = 1**; `/` and `/onboarding` un-onboarded: both = 1. (curl SSR cross-check: 1 on `/onboarding`, `/subjects`, print, quiz, listen, library, pipeline, session, `/nope`, and no-cookie `/`; the client-fetch screens — cookie `/`, subject detail, pathway — render their h1 post-hydration, counted via playwright per the plan) | PASS |
| 7 | Zero onClick navigation spans | `grep -rn "<span[^>]*onClick" app components` | empty — PASS |

## Cold-start captures (UI-01/UI-04 — no flash)

Fresh-profile (no cookie, no localStorage) load of `/`, sampled at
`domcontentloaded` and again after settle:

| Width | Result | Capture |
|-------|--------|---------|
| 1280 | first paint h1 = landing hero, settled identical, navigatedUrls `["http://localhost:3199/"]` (no bounce to wizard/dashboard) | `/tmp/shots/coldstart-1280.png` |
| 360 | first paint h1 = landing hero, settled identical, navigatedUrls `["http://localhost:3199/"]` | `/tmp/shots/coldstart-360.png` |

## Build + verify gate

- `npm run build` → **exit 0** (route table printed; no errors).
- Final gate re-ran after the rebuild on the fresh dev server: cookie sweep
  over the full default route list → **ALL VIEWPORTS CLEAN** (exit 0);
  `--no-cookie --routes /,/onboarding` → exit 0 (landing renders, not a
  redirect); hygiene greps 1–3 empty; this evidence file present with the
  FLOW-06 row.
- Server then LEFT RUNNING for the Task 2 checkpoint:
  `curl -s -o /dev/null http://localhost:3199/` → **HTTP 200** +
  SERVER-LEFT-RUNNING-FOR-CHECKPOINT. The checkpoint URL is
  http://localhost:3199/.

## Fix-forward notes

None — no fence failure required an app-code fix. Zero edits outside
`scripts/check-viewports.mjs` (default route list extended to the full 12
routes) and this evidence file.

Harness-only observations (not app defects):

- **Next dev-tools badge overlay (dev-only):** at 360w on dashboard routes the
  dev-overlay badge (`<nextjs-portal>`, bottom-left) sits over the TabBar's
  leftmost item and intercepts hit-tested Playwright clicks. The fence worked
  around it with `element.click()`; the overlay does not exist under
  `next start`/production builds. Surfaced for the human UAT: if the badge
  visually overlaps the bar in your dev window, click it away (it's the "N"
  Next logo, dev mode only).
- **SSR shell of client-fetch screens:** curl sees 0 `<h1` pre-hydration on
  cookie-`/`, subject detail and pathway (skeleton shell); post-hydration all
  count exactly 1 — the plan's prescribed playwright method was used for those.

## Deferred-items cross-check (phase fence)

- Item 1 (TopNav overflow <1024px): already marked CLEARED by 02-08 in
  `deferred-items.md`; re-proven by this sweep (all `(dashboard)` routes clean
  at 360/390/768).
- Item 2 (`lib/tokens.js` server-import doc): RESOLVED — the header comment
  now documents the accurate constraint ("cannot be imported by Server
  Components — use the CSS-var half"), verified by direct read 2026-08-16.
- Item 3 (page-content overflows on `/`, `/listen`, `/session`,
  `/onboarding`): RESOLVED — owning plans 02-09/02-10/02-11 landed; this plan's
  full-route sweep in BOTH cookie states returns ALL VIEWPORTS CLEAN, which is
  the gate the item named for 02-12.

(Recorded here rather than in `deferred-items.md` — this plan's files_modified
fence allows editing only `scripts/check-viewports.mjs` and this evidence
file.)

## Reproduction

```bash
npm i --no-save playwright-core
npm run dev -- --port 3199 &
node scripts/check-viewports.mjs --port 3199            # ALL VIEWPORTS CLEAN
node scripts/check-viewports.mjs --port 3199 --no-cookie --out /tmp/shots-nocookie
node /tmp/flow-0212.mjs                                  # 45/45 PASS (throwaway runner)
```

---
_Evidence recorded: 2026-08-16 · Executor: gsd-executor (02-12 Task 1) ·
Server left running at http://localhost:3199/ for the Task 2 human-verify checkpoint._
