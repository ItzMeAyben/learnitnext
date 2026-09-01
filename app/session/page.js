'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { LEARNER_NAME } from '../../lib/store.js'
import { tokens, pill, card, statusPill, useViewport } from '../../lib/tokens.js'
import TabBar from '../../components/TabBar.js'

// Session (02-11, UI-SPEC §12 row 9): the dark-chrome "sit down and study"
// screen. Desktop keeps the Phase-1 chrome verbatim (D-05) — ink page, 72px
// inkSoft rail with its icon Links + lime logo tile + avatar, light canvas
// content panel, lime hero 1.35fr beside the overnight/waiting column, shelf
// 4-across — now tokenized (var(--color-ink/ink-soft/canvas), §7.2) with the
// on-dark lime focus ring on the rail (§10).
//
// Tablet: rail stays, hero + column stack, shelf 2×2. Phone (<768): the rail
// is NOT rendered — the global TabBar covers navigation (its quiz/pathway
// destinations stay reachable via subject pages, per the spec note) — the
// hero goes full-width, waiting rows stack, and the shelf is a 2-col grid of
// compact tiles (art 96→64). Session lives OUTSIDE the (dashboard) group, so
// this page renders <TabBar/> itself, as the LAST element of the tree
// (02-RESEARCH Pattern 4); the content panel gets bottom clearance for the
// fixed bar.
//
// The learner's name comes from lib/store.js (D-03, 02-09) — the old local
// hardcoded constant is deleted; Today and Session now greet the same person.
//
// Phase 1 wires survive unchanged (D-11): rail Links on ≥768, both hero CTAs
// (/pathway/AI%20Agents, /listen?subject=AI%20Agents), the waiting rows
// (/subjects, /library), "Open the run log →" (/pipeline), and the shelf
// tiles' encodeURIComponent'd hrefs.
//
// §14.3 states (same copy as Today): loading → shelf skeleton tiles + sr-only
// "Setting up your session…"; error → "Couldn't load your morning — check the
// pipeline." + Retry (the fetch now throws on !res.ok like every other
// screen); empty → Today's empty copy in the lime hero slot. Header utilities
// ("Search everything" / "Save a link") are Phase 4 CAPT actions, so they
// render as honest disabled pills (§9.1 not-yet-wired idiom).

async function fetchSubjects() {
  const res = await fetch('/api/subjects')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// Type-role shortcuts (§6) — color lives at the use site (ink on the lime
// hero, secondary in cards, on-dark tokens in the rail).
const DISPLAY = {
  margin: 0,
  fontSize: tokens.type.display.size,
  lineHeight: tokens.type.display.lh,
  fontWeight: 700,
  letterSpacing: '-1px',
  color: 'var(--color-ink)',
}
const HEADING = {
  margin: 0,
  fontSize: tokens.type.heading.size,
  lineHeight: tokens.type.heading.lh,
  fontWeight: 700,
  letterSpacing: '-0.3px',
  color: 'var(--color-ink)',
}
const CAPTION = {
  fontSize: tokens.type.caption.size,
  lineHeight: tokens.type.caption.lh,
  color: 'var(--color-text-secondary)',
}
const BODY = {
  margin: 0,
  fontSize: tokens.type.body.size,
  lineHeight: tokens.type.body.lh,
  color: 'var(--color-text-secondary)',
}
const LIST_RESET = { margin: 0, padding: 0, listStyle: 'none' }

// Visually hidden loading line (§9.6) — the skeleton carries the visuals,
// screen readers get the copy.
const SR_ONLY = {
  position: 'absolute',
  left: -9999,
  width: 1,
  height: 1,
  overflow: 'hidden',
}

// Lime-card idiom (§9.10 + plan interfaces): ink (#12121a = rgb(18,18,26))
// with alpha over the lime hero — .65 body copy, .1 chip/pill surfaces.
const ON_LIME_SOFT = 'rgba(18,18,26,.65)'
const ON_LIME_CHIP = 'rgba(18,18,26,.1)'

// §7.4: white text only on subject tiles dark enough for it — Distribution's
// amber (#ffd84d) art tile flips to ink. Data-driven (tileColor comes from
// the API), so Phase 3 subjects resolve themselves.
function inkTextOnTile(hex) {
  const chan = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const luminance = 0.2126 * lin(chan[0]) + 0.7152 * lin(chan[1]) + 0.0722 * lin(chan[2])
  return luminance > 0.45
}

// Overnight stat (§6 exception): Display-32 numeral at line-height 1; the
// failed count uses danger-bright (§7.2, plan Task 2).
function Stat({ numeral, label, failed = false }) {
  return (
    <div>
      <div style={{ fontSize: tokens.type.display.size, lineHeight: 1, fontWeight: 700, letterSpacing: '-1px', color: failed ? 'var(--color-danger-bright)' : 'var(--color-ink)' }}>
        {numeral}
      </div>
      <div style={CAPTION}>{label}</div>
    </div>
  )
}

export default function SessionPage() {
  const { data: subjects, isError, refetch, isLoading } = useQuery({ queryKey: ['subjects'], queryFn: fetchSubjects })
  const viewport = useViewport()
  const isPhone = viewport === 'phone'
  const isDesktop = viewport === 'desktop'

  const shelfSubjects = (subjects ?? []).slice(0, 3)

  // §9.4 rail idiom, tokenized. All five Phase-1 destinations keep their
  // hrefs (D-11); on-dark gives the icon Links the lime focus ring (§10).
  const railLink = (active) => ({
    width: 44,
    height: 44,
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    textDecoration: 'none',
    color: active ? 'var(--color-surface)' : 'var(--color-on-dark-faint)',
    ...(active ? { background: 'rgba(255,255,255,.12)' } : null),
  })
  const rail = (
    <div className="on-dark" style={{ width: 72, flex: 'none', background: 'var(--color-ink-soft)', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'var(--space-md2) 0', gap: 'var(--space-lg)' }}>
      <div aria-hidden="true" style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--color-lime)', color: 'var(--color-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700 }}>L</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md2)', alignItems: 'center', marginTop: 'var(--space-sm2)' }}>
        <Link href="/" aria-label="Today" style={railLink(true)}>⌂</Link>
        <Link href="/subjects" aria-label="Subjects" style={railLink(false)}>▤</Link>
        <Link href="/listen" aria-label="Listen" style={railLink(false)}>♪</Link>
        <Link href="/quiz" aria-label="Quiz" style={railLink(false)}>?</Link>
        <Link href="/pathway/AI%20Agents" aria-label="Pathway" style={railLink(false)}>◍</Link>
      </div>
      <div aria-hidden="true" style={{ marginTop: 'auto', width: 40, height: 40, borderRadius: '50%', background: '#3a3a48' }}></div>
    </div>
  )

  const header = (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-sm2)', flexWrap: 'wrap' }}>
      <div>
        <div style={{ ...CAPTION, fontWeight: 700, letterSpacing: '.6px' }}>FRIDAY 14 AUGUST</div>
        <h1 style={{ ...DISPLAY, marginTop: 'var(--space-sm)' }}>Good morning, {LEARNER_NAME}</h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', ...(isPhone ? { width: '100%' } : null) }}>
        <button type="button" disabled title="Coming in a later update" className="btn btn-secondary btn-undone" style={{ ...pill('secondary'), ...(isPhone ? { flex: 1 } : null) }}>
          ⌕ Search everything
        </button>
        <button type="button" disabled title="Coming in a later update" className="btn btn-primary btn-undone" style={{ ...pill('primary'), ...(isPhone ? { flex: 1 } : null) }}>
          + Save a link
        </button>
      </div>
    </header>
  )

  // §9.10 lime hero — one of lime's reserved uses (§7.1). Eyebrow chip and
  // the listen CTA are ink-on-rgba(18,18,26,.1); "Continue reading" stays the
  // ink Primary pill. Both Phase-1 hrefs byte-identical (D-11).
  const hero = (
    <section style={{ flex: 1.35, minWidth: 0, background: 'var(--color-lime)', borderRadius: 'var(--radius-xxl)', padding: isPhone ? 'var(--space-md)' : 'var(--space-xl)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 'var(--space-md2)', minHeight: isPhone ? 0 : 236 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
        <span style={{ background: ON_LIME_CHIP, color: 'var(--color-ink)', borderRadius: 999, padding: '4px 10px', ...CAPTION, fontWeight: 700, letterSpacing: '.4px' }}>PICK UP WHERE YOU LEFT OFF</span>
        <span style={{ ...CAPTION, color: ON_LIME_SOFT }}>62% through</span>
      </div>
      <div>
        <h2 style={{ ...DISPLAY, maxWidth: 460 }}>AI Agents — study guide, part two</h2>
        <p style={{ ...BODY, color: ON_LIME_SOFT, margin: 'var(--space-sm2) 0 0', maxWidth: 440 }}>Built overnight from 24 sources you saved. Memory, tool use, and why most agent demos break in week two.</p>
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
        <Link href="/pathway/AI%20Agents" className="btn btn-primary" style={{ ...pill('primary'), ...(isPhone ? { flex: '1 1 100%' } : null) }}>
          Continue reading
        </Link>
        <Link href="/listen?subject=AI%20Agents" style={{ minHeight: 44, borderRadius: 999, padding: '12px 20px', fontSize: tokens.type.body.size, fontWeight: 700, background: ON_LIME_CHIP, color: 'var(--color-ink)', textDecoration: 'none', ...(isPhone ? { flex: '1 1 100%', textAlign: 'center' } : null) }}>
          ♪ Listen instead · 24 min
        </Link>
      </div>
    </section>
  )

  // Overnight digest — the failed numeral reads danger-bright; the run-log
  // link keeps its accent .btn-link idiom (Phase 1 href).
  const overnight = (
    <div style={{ ...card(), padding: 'var(--space-md2)' }}>
      <h3 style={HEADING}>Overnight</h3>
      <div style={{ display: 'flex', gap: 'var(--space-md2)', flexWrap: 'wrap' }}>
        <Stat numeral="6" label="sources read" />
        <Stat numeral="3" label="subjects updated" />
        <Stat numeral="1" label="failed" failed />
      </div>
      <Link href="/pipeline" className="btn btn-link" style={{ ...CAPTION, fontWeight: 700, justifySelf: 'start', display: 'inline-flex', alignItems: 'center' }}>
        Open the run log →
      </Link>
    </div>
  )

  // Waiting-on-you rows keep their Phase-1 Links (D-11); they are full-width
  // blocks, so the phone "stack" comes free.
  const waitingRow = (text, href) => (
    <Link href={href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-sm2)', background: 'var(--color-surface-tint)', borderRadius: 'var(--radius-md)', padding: '12px 14px', textDecoration: 'none', minWidth: 0 }}>
      <span style={{ fontSize: tokens.type.body.size, lineHeight: 1.45, color: 'var(--color-ink)', fontWeight: 500 }}>{text}</span>
      <span aria-hidden="true" style={{ fontSize: 14, color: 'var(--color-accent)', flex: 'none' }}>→</span>
    </Link>
  )
  const waiting = (
    <div style={{ ...card(), padding: 'var(--space-md2)', flex: 1 }}>
      <h3 style={HEADING}>Waiting on you</h3>
      {waitingRow('Rename subject "AI Agent" → "AI Agents"', '/subjects')}
      {waitingRow('1 paywalled article failed to read', '/library')}
    </div>
  )

  const sideColumn = (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-sm2)' }}>
      {overnight}
      {waiting}
    </div>
  )

  const heroRow = isDesktop ? (
    <div style={{ display: 'flex', gap: 'var(--space-md2)', alignItems: 'stretch' }}>
      {hero}
      {sideColumn}
    </div>
  ) : (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md2)' }}>
      {hero}
      {sideColumn}
    </div>
  )

  const shelfHeader = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-sm)' }}>
      <h2 style={HEADING}>Your shelf</h2>
      <span style={CAPTION}>Sorted by what changed last night</span>
    </div>
  )

  // §14.3 loading — shelf-shaped skeleton tiles stand in for the shelf while
  // the subjects query settles (the static hero/overnight/waiting content
  // keeps rendering); the sr-only line carries the copy.
  const shelfSkeleton = (
    <div aria-busy="true" style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(4,1fr)' : 'repeat(2,1fr)', gap: 'var(--space-sm2)' }}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="skeleton" style={{ height: isPhone ? 130 : 180, borderRadius: 'var(--radius-xl)', minWidth: 0 }} />
      ))}
    </div>
  )

  // §14.3 / §9.8 error — same copy as Today; the res.ok throw makes this
  // reachable.
  if (isError) {
    return (
      <ScreenChrome isPhone={isPhone} rail={rail}>
        <div role="alert" style={{ ...card(), flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
          <p style={{ ...BODY, color: 'var(--color-danger-text)' }}>Couldn&apos;t load your morning — check the pipeline.</p>
          <button type="button" className="btn btn-primary" style={pill('primary')} onClick={() => refetch()}>
            Retry
          </button>
        </div>
      </ScreenChrome>
    )
  }

  // §14.3 / §9.7 empty — same copy as Today's empty, in the lime hero slot.
  if (subjects && subjects.length === 0) {
    return (
      <ScreenChrome isPhone={isPhone} rail={rail}>
        {header}
        <section style={{ background: 'var(--color-lime)', borderRadius: 'var(--radius-xxl)', padding: isPhone ? 'var(--space-md)' : 'var(--space-xl)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--space-sm2)' }}>
          <h2 style={DISPLAY}>Your first night hasn&apos;t run yet</h2>
          <p style={{ ...BODY, color: ON_LIME_SOFT }}>Save a link, and tomorrow this page fills in.</p>
          <Link href="/onboarding" className="btn btn-ghost" style={pill('ghost')}>
            Start setup
          </Link>
        </section>
      </ScreenChrome>
    )
  }

  return (
    <ScreenChrome isPhone={isPhone} rail={rail}>
      {header}
      {isLoading ? <span style={SR_ONLY}>Setting up your session…</span> : null}
      {heroRow}
      {shelfHeader}
      {isLoading ? (
        shelfSkeleton
      ) : (
      <ul role="list" style={{ ...LIST_RESET, display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(4,1fr)' : 'repeat(2,1fr)', gap: 'var(--space-sm2)' }}>
        {shelfSubjects.map((subject) => (
          <li key={subject.id} style={{ minWidth: 0 }}>
            <Link
              href={`/subjects/${encodeURIComponent(subject.id)}`}
              style={{ height: '100%', background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: isPhone ? 'var(--space-sm2)' : 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm2)', textDecoration: 'none', minWidth: 0, boxSizing: 'border-box' }}
            >
              <div style={{ height: isPhone ? 64 : 96, borderRadius: 'var(--radius-md)', background: subject.tileColor, display: 'flex', alignItems: 'flex-end', padding: 'var(--space-sm)', boxSizing: 'border-box', color: inkTextOnTile(subject.tileColor) ? 'var(--color-ink)' : '#ffffff', fontSize: tokens.type.body.size, fontWeight: 700, letterSpacing: '-0.3px', overflow: 'hidden' }}>
                {subject.id}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-xs)' }}>
                <span style={CAPTION}>{subject.sourceCount} sources</span>
                <span style={{ ...statusPill('sorted'), flex: 'none' }}>+3 new</span>
              </div>
            </Link>
          </li>
        ))}
        <li style={{ minWidth: 0 }}>
          <div style={{ height: '100%', background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: isPhone ? 'var(--space-sm2)' : 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm2)', border: '1px dashed var(--color-border-strong)', minWidth: 0, boxSizing: 'border-box' }}>
            <div aria-hidden="true" style={{ height: isPhone ? 64 : 96, borderRadius: 'var(--radius-md)', background: 'var(--color-surface-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-faint)', fontSize: 24 }}>+</div>
            <div style={CAPTION}>Finance needs 2 more sources before it builds</div>
          </div>
        </li>
      </ul>
      )}
    </ScreenChrome>
  )
}

// Shared screen shell: ink page, rail beside the light content panel, TabBar
// last in the tree (phone only — the .tabbar class hides it ≥768), phone
// bottom clearance for the fixed bar. Extracted so the §14.3 state branches
// (loading / error / empty) render inside the same chrome.
function ScreenChrome({ isPhone, rail, children }) {
  return (
    <div style={{ background: 'var(--color-ink)', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <a href="#session-content" className="skip-link">Skip to content</a>
      <div style={{ width: '100%', maxWidth: 1440, padding: isPhone ? 'var(--space-xs)' : 'var(--space-sm2)', display: 'flex', gap: 'var(--space-sm2)', boxSizing: 'border-box' }}>
        {!isPhone && rail}
        <main
          id="session-content"
          style={{
            flex: 1,
            minWidth: 0,
            background: 'var(--color-canvas)',
            borderRadius: 'var(--radius-xl)',
            padding: isPhone
              ? 'var(--space-md) var(--space-md) calc(72px + env(safe-area-inset-bottom))'
              : 'var(--space-md2) var(--space-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-md2)',
          }}
        >
          {children}
        </main>
      </div>
      <TabBar />
    </div>
  )
}
