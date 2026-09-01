'use client'

import Link from 'next/link'
import { notFound, useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { tokens, pill, card, statusPill, GLYPHS, useViewport } from '../../../../lib/tokens.js'

// Subject hub (UI-SPEC §12 row 5): subject-colored hero + "Where it came from"
// 360px card side-by-side ≥~740px and stacked below it on phone (flex-wrap,
// zero JS), hero stats 4-across → 2×2 via auto-fit, material cards 3-across →
// 1-col, and the sources table swapped to §9.5 stacked cards on phone (the one
// structural DOM swap — useViewport). Phase 1 wires (D-11) are byte-identical:
// all six launcher Links + the action-row pathway Link keep their encoded
// hrefs, fetchSubject keeps null-on-404, and the notFound() guard is untouched.
// SOURCE_ROWS stays mock data — realism is Phase 3 (DATA-01).

async function fetchSubject(subjectId) {
  const res = await fetch(`/api/subjects/${encodeURIComponent(subjectId)}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

const SOURCE_ROWS = [
  { title: 'How agent memory actually works', author: 'Latent Space', saved: '13 Aug', status: 'done' },
  { title: 'Evaluating tool-use failures in the wild', author: 'Hamel Husain', saved: '11 Aug', status: 'done' },
  { title: 'Why your agent loops forever', author: '30 Minutes to PMF', saved: '9 Aug', status: 'done' },
  { title: 'Scheduling long-running agents', author: '—', saved: '5 Aug', status: 'unread' },
]

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

// §9.9 crumbs: links take the .crumb-link class (color is class-owned), each
// crumb is a 44px touch target with 8px vertical padding.
const CRUMB = {
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: tokens.touch,
  padding: '8px 2px',
  fontSize: tokens.type.caption.size,
}

const SR_ONLY = {
  position: 'absolute',
  left: -9999,
  width: 1,
  height: 1,
  overflow: 'hidden',
}

// §9.10: fluid hero padding — md (16) at phone, xl (32) from desktop widths up.
const HERO_PADDING = 'clamp(var(--space-md), 4vw, var(--space-xl))'

// §12 row 5: stats 4-across desktop → 2×2 phone from one auto-fit rule.
const STAT_GRID = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 110px), 1fr))',
  gap: 'var(--space-md)',
}

// §12 row 5: material cards 3-across → 1-col (auto-fit, zero JS).
const MATERIAL_GRID = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
  gap: 'var(--space-md2)',
}

const TABLE_COLUMNS = '1fr 200px 120px 110px'

function MaterialCard({ glyph, iconStyle, title, meta, progress, progressFill, children }) {
  return (
    <div style={card()}>
      <div
        aria-hidden="true"
        style={{
          width: 40,
          height: 40,
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 17,
          ...iconStyle,
        }}
      >
        {glyph}
      </div>
      <div>
        <div style={{ fontSize: tokens.type.heading.size, lineHeight: tokens.type.heading.lh, fontWeight: 700, letterSpacing: '-0.3px', color: 'var(--color-ink)' }}>{title}</div>
        <div style={{ ...CAPTION, marginTop: 4 }}>{meta}</div>
      </div>
      <div style={{ height: 6, borderRadius: 999, background: 'var(--color-surface-sunken)', overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: progressFill, borderRadius: 999 }} />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)', marginTop: 2 }}>{children}</div>
    </div>
  )
}

export default function SubjectPage() {
  const { subjectId } = useParams()
  const viewport = useViewport()
  let name = ''
  try {
    name = decodeURIComponent(subjectId)
  } catch {
    name = ''
  }
  const { data: subject, isError, refetch } = useQuery({
    queryKey: ['subject', name],
    queryFn: () => fetchSubject(name),
  })

  if (!name || subject === null) notFound()
  if (isError) {
    return (
      <div
        role="alert"
        style={{ ...card(), flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)' }}
      >
        <p style={{ ...BODY, color: 'var(--color-danger-text)' }}>Couldn't load — check the pipeline.</p>
        <button type="button" className="btn btn-primary" style={pill('primary')} onClick={() => refetch()}>
          Retry
        </button>
      </div>
    )
  }
  if (!subject) {
    return (
      <div aria-busy="true" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md2)' }}>
        <span style={SR_ONLY}>Opening the notebook…</span>
        <div className="skeleton" style={{ height: 264, borderRadius: 'var(--radius-xxl)' }} />
        <div style={MATERIAL_GRID}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton" style={{ height: 208, borderRadius: 'var(--radius-xl)' }} />
          ))}
        </div>
      </div>
    )
  }

  const stats = [
    { label: 'sources', value: subject.sourceCount },
    { label: 'docs built', value: subject.docsBuilt },
    { label: 'read', value: `${subject.readPct}%` },
    { label: 'last quiz', value: subject.lastQuiz },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md2)' }}>
      {/* Breadcrumb + action row: one line on desktop, the pills wrap on phone
          (rung 1 — flexWrap, no JS). Not-yet-wired actions are honest disabled
          .btn-undone buttons (§9.1), never dead spans. */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-xs)', fontSize: tokens.type.caption.size }}>
          <Link href="/subjects" className="crumb-link" style={CRUMB}>
            Subjects
          </Link>
          <span aria-hidden="true" style={{ ...CAPTION, color: 'var(--color-text-faint)' }}>/</span>
          <span style={{ ...CRUMB, color: 'var(--color-ink)', fontWeight: 700 }}>{subject.id}</span>
        </nav>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <button type="button" disabled className="btn btn-secondary btn-undone" style={pill('secondary')} title="Coming in a later update">
            Rename
          </button>
          <button type="button" disabled className="btn btn-secondary btn-undone" style={pill('secondary')} title="Coming in a later update">
            Open in Gemini Notebook ↗
          </button>
          <Link href={`/pathway/${encodeURIComponent(subject.id)}`} className="btn btn-secondary" style={pill('secondary')}>
            View pathway
          </Link>
          <button type="button" disabled className="btn btn-primary btn-undone" style={pill('primary')} title="Coming in a later update">
            Rebuild material
          </button>
        </div>
      </div>

      {/* Hero + provenance: side-by-side when ~720px+ of container exists,
          stacked (provenance below) on phone — flex-wrap does it (rung 1). */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch', gap: 'var(--space-md2)' }}>
        <section
          style={{
            flex: '1 1 360px',
            minWidth: 0,
            background: subject.color,
            borderRadius: 'var(--radius-xxl)',
            padding: HERO_PADDING,
            color: tokens.color.surface,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 'var(--space-lg)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            <span
              style={{
                alignSelf: 'flex-start',
                background: 'var(--color-on-color-chip)',
                borderRadius: 999,
                padding: '4px 12px',
                fontSize: tokens.type.caption.size,
                fontWeight: 700,
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
              }}
            >
              NOTEBOOK · {subject.sourceCount} SOURCES
            </span>
            <h1 style={{ margin: 0, fontSize: tokens.type.display.size, lineHeight: tokens.type.display.lh, fontWeight: 700, letterSpacing: '-1px' }}>{subject.id}</h1>
            <p style={{ ...BODY, color: 'var(--color-on-color-soft)', maxWidth: 520 }}>{subject.blurb}</p>
          </div>
          <div style={STAT_GRID}>
            {stats.map((stat) => (
              <div key={stat.label}>
                <div style={{ fontSize: tokens.type.display.size, lineHeight: 1, fontWeight: 700, letterSpacing: '-1px' }}>{stat.value}</div>
                <div style={{ ...CAPTION, color: 'var(--color-on-color-soft)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <aside style={{ ...card(), flex: '0 1 360px', maxWidth: '100%', gap: 'var(--space-sm2)' }}>
          <span style={{ fontSize: tokens.type.heading.size, lineHeight: tokens.type.heading.lh, fontWeight: 700, letterSpacing: '-0.3px', color: 'var(--color-ink)' }}>Where it came from</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {subject.sourceBreakdown.map((item) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <span style={{ ...CAPTION, width: 66, flex: 'none' }}>{item.label}</span>
                <div style={{ flex: 1, height: 8, borderRadius: 999, background: 'var(--color-surface-sunken)', overflow: 'hidden' }}>
                  <div style={{ width: `${item.pct}%`, height: '100%', background: item.color }} />
                </div>
                <span style={{ ...CAPTION, width: 22, textAlign: 'right' }}>{item.count}</span>
              </div>
            ))}
          </div>
          <div aria-hidden="true" style={{ height: 1, background: 'var(--color-divider)' }} />
          <span style={{ ...CAPTION, lineHeight: 1.5 }}>
            Oldest save 2 Jun · newest 13 Aug. Two sources sit at <span style={{ color: 'var(--color-danger-text)', fontWeight: 700 }}>failed</span> and are not in this notebook.
          </span>
        </aside>
      </div>

      <div style={MATERIAL_GRID}>
        <MaterialCard
          glyph={GLYPHS.guide}
          iconStyle={{ background: 'var(--color-accent-tint)', color: 'var(--color-accent)' }}
          title="Study guide"
          meta="18 min · 9 sections · 62% read"
          progress={62}
          progressFill="var(--color-accent)"
        >
          <Link href={`/pathway/${encodeURIComponent(subject.id)}`} className="btn btn-primary" style={pill('primary')}>
            Continue
          </Link>
          <Link href={`/listen?subject=${encodeURIComponent(subject.id)}`} className="btn btn-ghost" style={pill('ghost')}>
            ♪ Listen
          </Link>
        </MaterialCard>

        <MaterialCard
          glyph={GLYPHS.briefing}
          iconStyle={{ background: 'var(--color-success-tint)', color: 'var(--color-success-text)' }}
          title="Briefing doc"
          meta="6 min · the short version"
          progress={100}
          progressFill="var(--color-success)"
        >
          <Link href={`/pathway/${encodeURIComponent(subject.id)}`} className="btn btn-ghost" style={pill('ghost')}>
            Read again
          </Link>
        </MaterialCard>

        <MaterialCard
          glyph={GLYPHS.quiz}
          iconStyle={{ background: 'var(--color-amber-tint)', color: 'var(--color-amber-text)' }}
          title="Quiz"
          meta="12 questions · best score 8/12"
          progress={67}
          progressFill="var(--color-amber)"
        >
          <Link href={`/quiz?subject=${encodeURIComponent(subject.id)}`} className="btn btn-primary" style={pill('primary')}>
            Retake
          </Link>
          <Link href={`/quiz?subject=${encodeURIComponent(subject.id)}`} className="btn btn-ghost" style={pill('ghost')}>
            Review misses
          </Link>
        </MaterialCard>
      </div>

      <section style={{ ...card(), gap: 'var(--space-xs)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
          <h3 style={{ margin: 0, fontSize: tokens.type.heading.size, lineHeight: tokens.type.heading.lh, fontWeight: 700, letterSpacing: '-0.3px', color: 'var(--color-ink)' }}>Sources in this notebook</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <span style={{ background: 'var(--color-accent-tint)', color: 'var(--color-accent-text)', borderRadius: 999, padding: '7px 14px', fontSize: tokens.type.caption.size, fontWeight: 700 }}>All {subject.sourceCount}</span>
            <span style={{ ...CAPTION, borderRadius: 999, padding: '7px 14px' }}>Added this week</span>
            <span style={{ ...CAPTION, borderRadius: 999, padding: '7px 14px' }}>Unread</span>
          </div>
        </div>

        {viewport === 'phone' ? (
          // §9.5 phone: each row a stacked tinted card — title + status pill,
          // then the caption meta line. Table semantics consistently dropped.
          <div role="list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm2)' }}>
            {SOURCE_ROWS.map((row) => (
              <div
                key={row.title}
                role="listitem"
                style={{
                  background: 'var(--color-surface-tint)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-sm2)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-xs)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-sm)' }}>
                  <span style={{ fontSize: tokens.type.body.size, fontWeight: 700, color: 'var(--color-ink)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.title}</span>
                  <span style={{ ...statusPill(row.status), flex: 'none' }}>{row.status}</span>
                </div>
                <div style={CAPTION}>
                  {row.author} · {row.saved}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // ≥tablet: the 4-column grid (gap tightened to sm2), Caption 12
          // uppercase headers.
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: TABLE_COLUMNS,
                gap: 'var(--space-sm2)',
                fontSize: tokens.type.caption.size,
                fontWeight: 700,
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
                color: 'var(--color-text-secondary)',
                padding: '0 4px var(--space-sm)',
              }}
            >
              <span>Title</span>
              <span>Author</span>
              <span>Saved</span>
              <span>Status</span>
            </div>
            {SOURCE_ROWS.map((row) => (
              <div
                key={row.title}
                style={{
                  display: 'grid',
                  gridTemplateColumns: TABLE_COLUMNS,
                  gap: 'var(--space-sm2)',
                  alignItems: 'center',
                  padding: 'var(--space-sm2) 4px',
                  borderTop: '1px solid var(--color-divider)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm2)', minWidth: 0 }}>
                  <div aria-hidden="true" style={{ width: 44, height: 30, borderRadius: 'var(--radius-sm)', background: 'var(--color-surface-sunken)', flex: 'none' }} />
                  <span style={{ fontSize: tokens.type.body.size, fontWeight: 500, color: 'var(--color-ink)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.title}</span>
                </div>
                <span style={{ fontSize: tokens.type.body.size, color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.author}</span>
                <span style={CAPTION}>{row.saved}</span>
                <span style={{ ...statusPill(row.status), justifySelf: 'start' }}>{row.status}</span>
              </div>
            ))}
          </>
        )}
      </section>
    </div>
  )
}
