'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { wave } from '../lib/wave.js'
import { LEARNER_NAME } from '../lib/store.js'
import { tokens, pill, card, statusPill, useViewport } from '../lib/tokens.js'
import Icon from './Icon.js'

// Today hub (UI-SPEC §14.1 + §12 row 3, decision D-03): a lime greeting hero
// with the one-line overnight status and a subtle streak chip, exactly ONE
// primary next action ("Continue reading" into the featured subject's active
// pathway stage — the #active-stage anchor 02-04 installed), the subjects
// grid, and a quietly demoted rail (now playing / saved yesterday / last
// night's run) with Caption headers and no big numerals. The old giant Streak
// card is gone — streak lives only in the hero chip.
//
// Widget DATA stays mock until Phase 3's DATA-04 (hardcoded overnight counts,
// streak, listen duration). Phase 1 wires are untouched (D-11): the Finance
// tile, all four fresh-material Links, Session view, "See the full run →",
// and every subject tile keep their encodeURIComponent'd hrefs. Rendered
// inside <AppShell> (02-08) — no page chrome here, the component starts at
// the hero.
//
// §14.3 tone states (IN-01 closure): the fetch helpers throw on !res.ok like
// every other screen, and Today gains the loading skeleton, the error branch
// (it had none), and the empty branch around the Task 1 layout.

async function fetchSubjects() {
  const res = await fetch('/api/subjects')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

async function fetchLibrary() {
  const res = await fetch('/api/library')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

async function fetchPipeline() {
  const res = await fetch('/api/pipeline')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// Type-role shortcuts (§6) — color lives at the use site (ink on the lime
// hero, secondary in cards, on-dark tokens in the ink rail).
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
// Demoted-rail header idiom (§14.1.4): uppercase Caption 12/700 eyebrow.
const RAIL_HEAD = {
  fontSize: tokens.type.caption.size,
  lineHeight: tokens.type.caption.lh,
  fontWeight: 700,
  letterSpacing: '.6px',
  textTransform: 'uppercase',
  color: 'var(--color-text-secondary)',
}
const LIST_RESET = { margin: 0, padding: 0, listStyle: 'none' }
// Pills that carry a leading icon need their own flex context — pill() only
// returns box metrics, and an <a>'s default inline flow left the glyph
// baseline-aligned (sitting low against the label).
const LABEL_WITH_ICON = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-sm)' }

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

// Overnight proof strip between hero and subjects. hrefs are byte-identical
// to the Phase 1 strings ('/subjects/AI%20Agents' etc.), just built through
// encodeURIComponent now — D-11 fence.
const FRESH_MATERIAL = [
  { icon: 'doc', iconBg: 'var(--color-accent-tint)', iconFg: 'var(--color-accent)', title: 'Study guide', meta: 'AI Agents · 18 min read', href: `/subjects/${encodeURIComponent('AI Agents')}` },
  { icon: 'pencil', iconBg: 'var(--color-success-tint)', iconFg: 'var(--color-success-text)', title: 'Briefing doc', meta: 'Distribution · 6 min', href: `/subjects/${encodeURIComponent('Distribution')}` },
  { icon: 'help', iconBg: 'var(--color-amber-tint)', iconFg: 'var(--color-amber-text)', title: 'Quiz · 12 questions', meta: 'AI Agents · not started', href: `/quiz?subject=${encodeURIComponent('AI Agents')}` },
  { icon: 'headphones', iconBg: 'var(--color-danger-tint)', iconFg: 'var(--color-danger-text)', title: 'Audio episode', meta: 'Sales · 21 min', href: `/listen?subject=${encodeURIComponent('Sales')}` },
]

// Phase 4 actions (CAPT-01/02) render as honest disabled pills — full-opacity
// via .btn-undone, title explains, no onClick (§9.1 not-yet-wired idiom).
function UndonePill({ label, phoneStyle }) {
  return (
    <button type="button" disabled title="Coming in a later update" className="btn btn-ghost btn-undone" style={{ ...pill('ghost'), ...phoneStyle }}>
      {label}
    </button>
  )
}

function FeaturedTile({ subject }) {
  return (
    <Link
      href={`/subjects/${encodeURIComponent(subject.id)}`}
      style={{
        background: subject.color,
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-md)',
        color: tokens.color.surface,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 'var(--space-md)',
        height: '100%',
        textDecoration: 'none',
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-sm)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--space-sm)' }}>
          <span style={{ background: 'var(--color-amber)', color: 'var(--color-ink)', borderRadius: 999, padding: '4px 10px', fontSize: tokens.type.caption.size, fontWeight: 700, lineHeight: 1.4 }}>New today</span>
          <span style={{ fontSize: tokens.type.heading.size, lineHeight: tokens.type.heading.lh, fontWeight: 700, letterSpacing: '-0.3px' }}>{subject.id}</span>
        </div>
        <div
          aria-hidden="true"
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: 'var(--color-on-color-chip)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 'none',
          }}
        >
          <Icon name="notebook" size={18} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
        <div aria-hidden="true" style={{ height: 6, borderRadius: 999, background: 'var(--color-on-color-chip)', overflow: 'hidden' }}>
          <div style={{ width: `${subject.readPct}%`, height: '100%', background: 'var(--color-amber)', borderRadius: 999 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-sm)', fontSize: tokens.type.caption.size, color: 'var(--color-on-color-soft)' }}>
          <span>Study guide read</span>
          <span>{subject.readPct}% · {subject.sourceCount} sources</span>
        </div>
      </div>
    </Link>
  )
}

// Row tile shell — height:100% so a short row still fills its stretched grid
// cell instead of leaving a gap under itself next to a taller sibling.
const ROW_TILE = {
  background: 'var(--color-surface-tint)',
  borderRadius: 'var(--radius-lg)',
  padding: '14px 16px',
  minHeight: 64,
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--space-sm)',
  textDecoration: 'none',
  minWidth: 0,
}

function ListTile({ subject }) {
  return (
    <li style={{ display: 'flex', minWidth: 0 }}>
      <Link
        href={`/subjects/${encodeURIComponent(subject.id)}`}
        style={{ ...ROW_TILE, flex: 1 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm2)', minWidth: 0 }}>
          <div aria-hidden="true" style={{ width: 10, height: 10, borderRadius: '50%', background: subject.tileColor, flex: 'none' }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: tokens.type.body.size, fontWeight: 700, color: 'var(--color-ink)' }}>{subject.id}</div>
            <div style={CAPTION}>{subject.sourceCount} sources · {subject.readPct}% read</div>
          </div>
        </div>
        <span style={{ ...statusPill('sorted'), flex: 'none' }}>{subject.readPct}%</span>
      </Link>
    </li>
  )
}

export default function Today() {
  // The subjects query is the screen's primary query — it drives §14.3.
  const { data: subjects, isError, refetch, isLoading } = useQuery({ queryKey: ['subjects'], queryFn: fetchSubjects })
  const { data: library } = useQuery({ queryKey: ['library'], queryFn: fetchLibrary })
  const { data: pipeline } = useQuery({ queryKey: ['pipeline'], queryFn: fetchPipeline })
  const viewport = useViewport()
  const isPhone = viewport === 'phone'
  const isDesktop = viewport === 'desktop'

  const featured = subjects?.find((s) => s.id === 'AI Agents')
  const others = subjects?.filter((s) => s.id !== 'AI Agents') ?? []
  const notebookCount = (subjects?.length ?? 3) + 1

  // §14.1.4: the rail shows the first 3 saved rows (was 4).
  const savedRows = library
    ? [...library]
        .sort((a, b) => (a.added < b.added ? 1 : a.added > b.added ? -1 : 0))
        .slice(0, 3)
    : []

  const waveBars = wave(42, 0.38, tokens.color.lime, 'rgba(255,255,255,.22)')

  // §9.10 lime hero shell (shared by the greeting and the empty state).
  const heroStyle = {
    background: 'var(--color-lime)',
    borderRadius: 'var(--radius-xxl)',
    padding: isPhone ? 'var(--space-md)' : 'var(--space-xl)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm2)',
    minWidth: 0,
  }

  // §14.3 loading — hero-shaped block + 3 column skeletons in the
  // subjects/rail shape replace the old implicit blank.
  if (isLoading) {
    return (
      <div aria-busy="true" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md2)', minWidth: 0 }}>
        <span style={SR_ONLY}>Waking up your dashboard…</span>
        <div className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-xxl)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md2)' }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-xl)', minWidth: 0 }} />
          ))}
        </div>
      </div>
    )
  }

  // §14.3 / §9.8 error — the res.ok throws make this reachable; Today had no
  // error branch before (Phase 1 IN-01).
  if (isError) {
    return (
      <div role="alert" style={{ ...card(), flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
        <p style={{ ...BODY, color: 'var(--color-danger-text)' }}>Couldn't load your morning — check the pipeline.</p>
        <button type="button" className="btn btn-primary" style={pill('primary')} onClick={() => refetch()}>
          Retry
        </button>
      </div>
    )
  }

  // §14.3 / §9.7 empty — the greeting still greets; the hero slot carries
  // the empty idiom and the setup door.
  if (subjects && subjects.length === 0) {
    return (
      <section style={heroStyle}>
        <h1 style={DISPLAY}>Built while you slept, {LEARNER_NAME}</h1>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--space-sm2)' }}>
          <h2 style={HEADING}>Your first night hasn't run yet</h2>
          <p style={{ ...BODY, color: ON_LIME_SOFT }}>Save a link, and tomorrow this page fills in.</p>
          <Link href="/onboarding" className="btn btn-ghost" style={pill('ghost')}>
            Start setup
          </Link>
        </div>
      </section>
    )
  }

  // §14.1.1 greeting hero — lime card, single-ink Display (name emphasis
  // comes free at 700), one-line overnight status, streak as a quiet chip.
  // Above phone the copy stack and the streak chip sit on one row: stacked,
  // the hero was ~180px of mostly-empty lime with every element hugging the
  // left edge of a 1376px card. Phone keeps the stack (no room to split).
  const streakChip = (
    <span style={{ alignSelf: 'flex-start', flex: 'none', background: ON_LIME_CHIP, color: 'var(--color-ink)', borderRadius: 999, padding: '6px 14px', fontSize: tokens.type.caption.size, fontWeight: 700, lineHeight: 1.4 }}>37-day streak · keep it going</span>
  )
  const hero = (
    <section
      style={{
        ...heroStyle,
        ...(isPhone
          ? null
          : { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-lg)' }),
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', minWidth: 0 }}>
        <h1 style={DISPLAY}>Built while you slept, {LEARNER_NAME}</h1>
        <p style={{ ...BODY, color: ON_LIME_SOFT }}>Last run {pipeline?.lastRunAt ?? '6:04am'} · 6 new sources read · 3 subjects updated</p>
      </div>
      {streakChip}
    </section>
  )

  // §14.1.2 ONE primary action + Ghost listen + demoted utilities. Phone:
  // full-width pills in order, the two undone utilities share a 2-up row.
  // The Link pills are <a>: stretched full-width on phone they left-aligned
  // their label while the <button> pills beside them centered, so the column
  // read as ragged. Centering is set here, not on .btn (which <a> shares).
  const fullPhone = { flex: '1 1 100%', ...LABEL_WITH_ICON, display: 'flex' }
  const halfPhone = { flex: '1 1 calc(50% - 8px)' }
  const actions = featured ? (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)', alignItems: 'center' }}>
      <Link href={`/pathway/${encodeURIComponent(featured.id)}#active-stage`} className="btn btn-primary" style={{ ...pill('primary'), ...(isPhone ? fullPhone : null) }}>
        Continue reading
      </Link>
      <Link href={`/listen?subject=${encodeURIComponent(featured.id)}`} className="btn btn-ghost" style={{ ...pill('ghost'), ...LABEL_WITH_ICON, ...(isPhone ? fullPhone : null) }}>
        <Icon name="headphones" size={16} />
        Listen instead · 24 min
      </Link>
      <Link href="/session" className="btn btn-secondary" style={{ ...pill('secondary'), ...(isPhone ? fullPhone : null) }}>
        Session view
      </Link>
      <UndonePill label="Save a link" phoneStyle={isPhone ? halfPhone : null} />
      <UndonePill label="Run now" phoneStyle={isPhone ? halfPhone : null} />
    </div>
  ) : null

  // Overnight proof strip — 4-across desktop / 2×2 tablet / 2-col phone.
  const fresh = (
    <div style={card()}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-sm)' }}>
        <h2 style={HEADING}>Fresh material</h2>
        <span style={{ background: 'var(--color-surface-sunken)', borderRadius: 999, padding: '4px 12px', ...CAPTION }}>Today</span>
      </div>
      {/* 200px floor, not 160: at 1024 the left column is ~560px inner, so a
          160 floor fitted exactly 3 and orphaned the 4th tile on its own row
          beside a gap. 200 falls to a clean 2×2 there and still gives 4-across
          once the column can hold them (≥1280-ish). */}
      <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(auto-fit, minmax(200px, 1fr))' : '1fr 1fr', gap: 'var(--space-sm2)' }}>
        {FRESH_MATERIAL.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            style={{
              background: 'var(--color-surface-tint)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-sm2)',
              minHeight: 104,
              justifyContent: 'space-between',
              textDecoration: 'none',
              minWidth: 0,
            }}
          >
            <div aria-hidden="true" style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: item.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.iconFg }}>
              <Icon name={item.icon} size={18} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: tokens.type.body.size, fontWeight: 700, color: 'var(--color-ink)' }}>{item.title}</div>
              <div style={CAPTION}>{item.meta}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )

  // §14.1.3 subjects grid — featured colored tile full-width, list tiles +
  // the Finance stub beside it; 1-col phone (§12 row 3).
  const subjectsCard = (
    <div style={card()}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-sm)' }}>
        <h2 style={HEADING}>Your subjects</h2>
        <span style={CAPTION}>{notebookCount} notebooks</span>
      </div>
      <ul role="list" style={{ ...LIST_RESET, display: 'grid', gridTemplateColumns: isPhone ? '1fr' : '1fr 1fr', gap: 'var(--space-sm2)' }}>
        {/* gridColumn belongs on the <li> — the <li> is the grid item, the
            <Link> inside it is not, so setting it there did nothing and the
            featured tile sat in column 1 with dead space under its short
            neighbour. Same reason ListTile's <li> needs the flex stretch. */}
        {featured && (
          <li style={{ gridColumn: '1 / -1' }}>
            <FeaturedTile subject={featured} />
          </li>
        )}
        {others.map((subject) => (
          <ListTile key={subject.id} subject={subject} />
        ))}
        {/* full-width: with 2 real subjects beside the featured tile this stub
            is the odd third item, and a half-width last row left an empty
            cell. As the "go see the rest" door a footer row also reads right. */}
        <li style={{ display: 'flex', minWidth: 0, gridColumn: '1 / -1' }}>
          <Link href="/subjects" style={{ ...ROW_TILE, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm2)', minWidth: 0 }}>
              {/* dot spacer keeps Finance's text on the same x as the coloured
                  subject rows above it — it read as misaligned without one */}
              <div aria-hidden="true" style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-border-strong)', flex: 'none' }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: tokens.type.body.size, fontWeight: 700, color: 'var(--color-ink)' }}>Finance</div>
                <div style={CAPTION}>3 sources · needs 2 more</div>
              </div>
            </div>
            <Icon name="arrowRight" size={16} style={{ color: 'var(--color-text-faint)' }} />
          </Link>
        </li>
      </ul>
    </div>
  )

  // §14.1.4 quietly demoted rail — compact cards, Caption-12 uppercase
  // headers, no big numerals. Now playing keeps the ink mini-card idiom
  // (card({dark:true}) + 34px wave + lime art tile); transport stays
  // decorative (widget mock until Phase 3 DATA-04).
  const nowPlaying = (
    <div className="on-dark" style={{ ...card({ dark: true }), padding: 'var(--space-md)', gap: 'var(--space-sm2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-sm)' }}>
        <span style={{ ...RAIL_HEAD, color: 'var(--color-on-dark-secondary)' }}>Now playing</span>
        <span style={{ ...CAPTION, color: 'var(--color-on-dark-faint)' }}>1.5×</span>
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-sm2)', alignItems: 'center', minWidth: 0 }}>
        <div
          aria-hidden="true"
          style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', background: 'var(--color-lime)', flex: 'none', display: 'flex', alignItems: 'flex-end', padding: 'var(--space-sm)', color: 'var(--color-ink)', fontSize: 10, fontWeight: 700, lineHeight: 1.1 }}
        >
          AI<br />AGENTS
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: tokens.type.body.size, fontWeight: 700, lineHeight: 1.25, color: 'var(--color-surface)' }}>Study guide: AI Agents</div>
          <div style={{ ...CAPTION, color: 'var(--color-on-dark-secondary)', marginTop: 2 }}>Episode 8 · 24 min</div>
        </div>
      </div>
      <div aria-hidden="true" style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 34 }}>
        {waveBars.map((bar, i) => (
          <div key={i} style={{ flex: 1, borderRadius: 2, height: `${bar.h}%`, background: bar.c }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', ...CAPTION, color: 'var(--color-on-dark-faint)' }}>
        <span>09:12</span>
        <span>-14:48</span>
      </div>
      <div aria-hidden="true" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'var(--space-xs)' }}>
        <Icon name="rotateBack" size={18} style={{ color: 'var(--color-on-dark-secondary)' }} />
        <Icon name="rewind" size={20} filled style={{ color: 'var(--color-on-color-soft)' }} />
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--color-surface)', color: 'var(--color-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="pause" size={18} style={{ strokeWidth: 2.25 }} />
        </div>
        <Icon name="fastForward" size={20} filled style={{ color: 'var(--color-on-color-soft)' }} />
        <Icon name="shuffle" size={18} style={{ color: 'var(--color-on-dark-secondary)' }} />
      </div>
    </div>
  )

  const savedYesterday = (
    <div style={{ ...card(), padding: 'var(--space-md)', gap: 'var(--space-sm2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-sm)' }}>
        <span style={RAIL_HEAD}>Saved yesterday</span>
        <span style={CAPTION}>{library?.length ?? 6} links</span>
      </div>
      <ul role="list" style={{ ...LIST_RESET, display: 'flex', flexDirection: 'column' }}>
        {savedRows.map((row) => (
          <li
            key={row.id}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-sm)', padding: '10px 0', borderTop: '1px solid var(--color-divider)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm2)', minWidth: 0 }}>
              <div aria-hidden="true" style={{ width: 24, height: 24, borderRadius: 'var(--radius-sm)', background: 'var(--color-surface-sunken)', flex: 'none' }} />
              <span style={{ fontSize: tokens.type.body.size, color: 'var(--color-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.title}</span>
            </div>
            <span style={{ ...statusPill(row.status), flex: 'none' }}>{row.status}</span>
          </li>
        ))}
      </ul>
      {/* alignSelf, not justifySelf: this is a flex column, so justifySelf was
          a no-op and the link's box (and hover underline) spanned the card. */}
      <Link href="/library" className="btn btn-link" style={{ ...CAPTION, fontWeight: 700, alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        Library
        <Icon name="arrowRight" size={14} />
      </Link>
    </div>
  )

  const lastNightRun = (
    <div style={{ ...card(), padding: 'var(--space-md)', gap: 'var(--space-sm2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-sm)' }}>
        <span style={RAIL_HEAD}>Last night's run</span>
        <span style={statusPill('done')}>{pipeline?.lastRunAt ?? '—'}</span>
      </div>
      <div aria-hidden="true" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ flex: 1, height: 5, borderRadius: 999, background: 'var(--color-accent)' }} />
        <div style={{ flex: 1, height: 5, borderRadius: 999, background: 'var(--color-accent)' }} />
        <div style={{ flex: 1, height: 5, borderRadius: 999, background: 'var(--color-accent)' }} />
        <div style={{ flex: 1, height: 5, borderRadius: 999, background: 'var(--color-amber)' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', ...CAPTION }}>
        <span>capture</span>
        <span>fetch</span>
        <span>sort</span>
        <span>build</span>
      </div>
      <Link href="/pipeline" className="btn btn-link" style={{ ...CAPTION, fontWeight: 700, alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        See the full run
        <Icon name="arrowRight" size={14} />
      </Link>
    </div>
  )

  // §12 row 3 layouts. Phone: hero → action row → subjects → fresh 2-col →
  // saved yesterday → run health → now playing. Desktop: hero → actions →
  // 1fr 336px grid (left: fresh + subjects · right: the demoted rail).
  // Tablet: rail collapses to a 2-col row below subjects.
  if (isPhone) {
    return (
      <>
        {hero}
        {actions}
        {subjectsCard}
        {fresh}
        {savedYesterday}
        {lastNightRun}
        {nowPlaying}
      </>
    )
  }

  if (!isDesktop) {
    return (
      <>
        {hero}
        {actions}
        {fresh}
        {subjectsCard}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md2)', alignItems: 'start' }}>
          {nowPlaying}
          {savedYesterday}
          <div style={{ gridColumn: '1 / -1' }}>{lastNightRun}</div>
        </div>
      </>
    )
  }

  return (
    <>
      {hero}
      {actions}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 336px', gap: 'var(--space-md2)', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md2)', minWidth: 0 }}>
          {fresh}
          {subjectsCard}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md2)', minWidth: 0 }}>
          {nowPlaying}
          {savedYesterday}
          {lastNightRun}
        </div>
      </div>
    </>
  )
}
