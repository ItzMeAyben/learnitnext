'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { tokens, pill, card, GLYPHS } from '../../../lib/tokens.js'

// Subjects index (UI-SPEC §12 row 4 + §14.3): featured colored tile full-width,
// the rest as auto-fit list tiles (2-col wide → 1-col phone, zero JS), friendly
// skeleton/empty/error states, everything token-driven. Phase 1 wires (D-11)
// are untouched: every tile is a Link with an encodeURIComponent'd href and
// fetchSubjects keeps its res.ok throw.

async function fetchSubjects() {
  const res = await fetch('/api/subjects')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

const DISPLAY = {
  margin: 0,
  fontSize: tokens.type.display.size,
  lineHeight: tokens.type.display.lh,
  fontWeight: 700,
  letterSpacing: '-1px',
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

// Visually hidden loading line (§9.6) — the skeleton carries the visuals,
// screen readers get the copy.
const SR_ONLY = {
  position: 'absolute',
  left: -9999,
  width: 1,
  height: 1,
  overflow: 'hidden',
}

const LIST_RESET = { margin: 0, padding: 0, listStyle: 'none' }

// §12 row 4: the "others" tiles collapse 2-col → 1-col from one auto-fit rule
// (research Pattern 3 rung 2 — no media queries, no JS). The min(100%,…)
// guard keeps the 280px floor from overflowing at 320px content width.
const TILE_GRID = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
  gap: 'var(--space-sm2)',
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
        gap: 'var(--space-sm2)',
        textDecoration: 'none',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-sm)' }}>
        <span style={{ fontSize: tokens.type.heading.size, lineHeight: tokens.type.heading.lh, fontWeight: 700, letterSpacing: '-0.3px' }}>{subject.id}</span>
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
            fontSize: 16,
            flex: 'none',
          }}
        >
          {GLYPHS.notebook}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ height: 6, borderRadius: 999, background: 'var(--color-on-color-chip)', overflow: 'hidden' }}>
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

function ListTile({ subject }) {
  return (
    <li>
      <Link
        href={`/subjects/${encodeURIComponent(subject.id)}`}
        style={{
          background: 'var(--color-surface-tint)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-sm)',
          textDecoration: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm2)', minWidth: 0 }}>
          <div aria-hidden="true" style={{ width: 10, height: 10, borderRadius: '50%', background: subject.tileColor, flex: 'none' }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: tokens.type.body.size, fontWeight: 700, color: 'var(--color-ink)' }}>{subject.id}</div>
            <div style={{ ...CAPTION, marginTop: 2 }}>{subject.sourceCount} sources · {subject.readPct}% read</div>
          </div>
        </div>
        <span
          style={{
            background: 'var(--color-accent-tint)',
            color: 'var(--color-accent-text)',
            borderRadius: 999,
            padding: '4px 10px',
            fontSize: tokens.type.caption.size,
            fontWeight: 700,
            flex: 'none',
          }}
        >
          {subject.readPct}%
        </span>
      </Link>
    </li>
  )
}

export default function SubjectsIndexPage() {
  const { data: subjects, isError, refetch } = useQuery({ queryKey: ['subjects'], queryFn: fetchSubjects })

  if (isError) {
    return (
      <div
        role="alert"
        style={{ ...card(), flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)' }}
      >
        <p style={{ ...BODY, color: 'var(--color-danger-text)' }}>Couldn't load subjects — check the pipeline.</p>
        <button type="button" className="btn btn-primary" style={pill('primary')} onClick={() => refetch()}>
          Retry
        </button>
      </div>
    )
  }

  if (!subjects) {
    return (
      <div style={card()}>
        <h1 style={DISPLAY}>Subjects</h1>
        <div aria-busy="true" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm2)' }}>
          <span style={SR_ONLY}>Sorting last night's haul…</span>
          <div className="skeleton" style={{ height: 96, borderRadius: 'var(--radius-lg)' }} />
          <div style={TILE_GRID}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 96, borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const [featured, ...others] = subjects

  return (
    <div style={card()}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
        <h1 style={DISPLAY}>Subjects</h1>
        <span style={CAPTION}>{subjects.length} notebooks</span>
      </div>

      {subjects.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 'var(--space-sm2)', padding: 'var(--space-xl2) var(--space-md)' }}>
          <div
            aria-hidden="true"
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface-tint)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 17,
            }}
          >
            {GLYPHS.notebook}
          </div>
          <div style={{ fontSize: tokens.type.heading.size, lineHeight: tokens.type.heading.lh, fontWeight: 700, letterSpacing: '-0.3px', color: 'var(--color-ink)' }}>No subjects yet</div>
          <p style={{ ...BODY, maxWidth: 340 }}>They appear here as soon as your saved links get sorted. Nothing to do — keep saving.</p>
          <Link href="/library" className="btn btn-link" style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>
            Open your library →
          </Link>
        </div>
      ) : (
        <>
          {featured && <FeaturedTile subject={featured} />}
          {others.length > 0 && (
            <ul style={{ ...LIST_RESET, ...TILE_GRID }} aria-label="Your subjects">
              {others.map((subject) => (
                <ListTile key={subject.id} subject={subject} />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
