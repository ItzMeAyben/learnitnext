'use client'

// Pipeline — Phase 2 responsive overhaul (02-07). The ONE live mutation in the
// app ("Run all now" → POST /api/pipeline/run) keeps its exact Phase 1 wiring
// (D-11 fence): the useMutation call, queryFn and onSuccess setQueryData are
// untouched below. Everything else around it moved onto the 02-01 tokens:
// §14.3 tone states (skeleton/error/empty), tokenized step cards in a
// reflowing grid (§12 row 11), and §9.1 honest disabled action pills — every
// not-yet-wired control (Schedule ▾, Retry all, Rename, Keep, Copy log, Open
// skill) is a real disabled button with title="Coming in a later update", no
// dead spans. Step/log DATA stays mock — Phase 5 (PIPE-01/02) owns semantics.

import { Fragment } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tokens, pill, card, statusPill, useViewport, GLYPHS } from '../../../lib/tokens.js'

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

// Visually hidden line (§9.6/§11.3) — same idiom as the sibling screens.
const SR_ONLY = {
  position: 'absolute',
  left: -9999,
  width: 1,
  height: 1,
  overflow: 'hidden',
}

// §7.2 status dots — decorative (aria-hidden), so notify/faint are allowed here.
const STATUS_DOT = {
  ok: 'var(--color-success)',
  warn: 'var(--color-notify)',
  active: 'var(--color-accent)',
}

// §12 row 11: phone renders the steps as an explicit 2-across grid; ≥768 one
// auto-fit rule collapses 3-across tablet → 6-across wide desktop (rung 2,
// container-driven — no JS needed past the structural phone branch).
function stepGrid(isPhone) {
  return isPhone ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(200px, 1fr))'
}

function StepCard({ step }) {
  const isActive = step.status === 'active'
  const soft = isActive ? 'var(--color-accent-text)' : 'var(--color-text-secondary)'
  return (
    <div
      style={{
        background: isActive ? 'var(--color-accent-tint)' : 'var(--color-surface-tint)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-sm2)',
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ ...CAPTION, fontWeight: 700, color: soft }}>{step.n}</span>
        <span
          aria-hidden="true"
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: STATUS_DOT[step.status] ?? 'var(--color-text-faint)',
          }}
        ></span>
      </div>
      <div
        style={{
          fontSize: tokens.type.body.size,
          lineHeight: tokens.type.body.lh,
          fontWeight: 700,
          color: isActive ? 'var(--color-accent-text)' : 'var(--color-ink)',
        }}
      >
        {step.name}
      </div>
      <div style={{ ...CAPTION, color: soft }}>{step.desc}</div>
      <div style={{ ...CAPTION, fontFamily: tokens.type.mono, marginTop: 'auto', color: soft }}>{step.time}</div>
    </div>
  )
}

// The working control (§9.1: the ONE primary on this view). Same mutation,
// same pending guard, same label logic as Phase 1 — now a real <button>.
function RunAllButton({ mutation }) {
  return (
    <button
      type="button"
      className="btn btn-primary"
      style={pill('primary')}
      disabled={mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      {mutation.isPending ? 'Running…' : 'Run all now'}
    </button>
  )
}

function RunLogLine({ entry }) {
  const msg = entry.msg
  let before = msg
  let marked = ''
  let after = ''

  if (entry.highlight && msg.includes(entry.highlight)) {
    const idx = msg.indexOf(entry.highlight)
    before = msg.slice(0, idx)
    marked = entry.highlight
    after = msg.slice(idx + entry.highlight.length)
  } else if (entry.bad && msg.includes('failed')) {
    const idx = msg.indexOf('failed')
    before = msg.slice(0, idx)
    marked = 'failed'
    after = msg.slice(idx + 'failed'.length)
  }

  return (
    <span>
      <span style={{ color: 'var(--color-on-dark-faint)' }}>{entry.t}</span> {before}
      {marked && (
        <span style={{ color: entry.bad ? 'var(--color-danger-bright)' : 'var(--color-lime)' }}>{marked}</span>
      )}
      {after}
    </span>
  )
}

// §7.3 status ladder — the four rung tiles (mock counts; Phase 5 PIPE-01/02
// owns the semantics). Numerals Display 32 lh 1 (the §6 stat-numeral
// exception, absorbing the old 20px); labels Caption.
const RUNGS = [
  { n: '7', label: 'new', flex: 7 },
  { n: '12', label: 'fetched', flex: 12 },
  { n: '9', label: 'sorted', flex: 9 },
  { n: '380', label: 'done', flex: 16 },
]

function RungTile({ rung, desktop }) {
  const isNew = rung.label === 'new'
  const isDone = rung.label === 'done'
  const numeralColor = isNew ? '#fff' : isDone ? 'var(--color-success-text)' : 'var(--color-ink)'
  const labelColor = isNew
    ? 'var(--color-on-color-soft)'
    : isDone
      ? 'var(--color-success-text)'
      : rung.label === 'sorted'
        ? 'var(--color-accent-text)'
        : 'var(--color-text-secondary)'
  return (
    <div
      style={{
        // Desktop keeps the Phase 1 flex proportions (D-05); tablet/phone
        // rungs go full-width inside their grid cell / column.
        ...(desktop ? { flex: rung.flex } : { width: '100%' }),
        background: isNew
          ? 'var(--color-accent)'
          : isDone
            ? 'var(--color-success-tint)'
            : 'var(--color-surface-tint)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-md)',
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: tokens.type.display.size,
          lineHeight: 1,
          fontWeight: 700,
          letterSpacing: '-1px',
          color: numeralColor,
        }}
      >
        {rung.n}
      </div>
      <div style={{ ...CAPTION, color: labelColor }}>{rung.label}</div>
    </div>
  )
}

// Decorative flow arrows (§12 row 11) — aria-hidden, text-faint.
function LadderArrow({ dir, style }) {
  return (
    <span
      aria-hidden="true"
      style={{
        color: 'var(--color-text-faint)',
        fontSize: tokens.type.caption.size,
        lineHeight: tokens.type.caption.lh,
        ...style,
      }}
    >
      {dir}
    </span>
  )
}

export default function PipelinePage() {
  const queryClient = useQueryClient()
  const viewport = useViewport()
  const isPhone = viewport === 'phone'

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['pipeline'],
    queryFn: () => fetch('/api/pipeline').then((r) => r.json()),
  })

  const mutation = useMutation({
    mutationFn: () => fetch('/api/pipeline/run', { method: 'POST' }).then((r) => r.json()),
    onSuccess: (result) => {
      queryClient.setQueryData(['pipeline'], result)
    },
  })

  const h1 = {
    margin: 0,
    fontSize: tokens.type.display.size,
    lineHeight: tokens.type.display.lh,
    fontWeight: 700,
    letterSpacing: '-1px',
    color: 'var(--color-ink)',
  }

  if (isLoading) {
    /* §14.3 loading: 6 step-card skeletons in the same grid (§9.6), never
       bare "Loading…" text. */
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md2)' }}>
        <h1 style={h1}>Pipeline</h1>
        <div style={card()}>
          <div
            aria-busy="true"
            style={{
              display: 'grid',
              gridTemplateColumns: stepGrid(isPhone),
              gap: 'var(--space-sm2)',
              paddingTop: 'var(--space-xs)',
            }}
          >
            <span style={SR_ONLY}>Replaying last night's run…</span>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton" style={{ height: 110 }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (isError || !data) {
    /* §14.3/§9.8 error: one calm danger line + Retry, role=alert. */
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md2)' }}>
        <h1 style={h1}>Pipeline</h1>
        <div style={card()}>
          <div
            role="alert"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 'var(--space-sm2)',
              padding: 'var(--space-sm2) 0',
            }}
          >
            <p style={{ ...BODY, color: 'var(--color-danger-text)' }}>Couldn't load the pipeline.</p>
            <button type="button" className="btn btn-primary" style={pill('primary')} onClick={() => refetch()}>
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  const header = (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 'var(--space-md)',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <h1 style={h1}>Pipeline</h1>
        <p style={{ ...BODY, margin: '6px 0 0' }}>
          Six skills, daily at 6:00am · last run finished {data.lastRunAt} in 4m 12s
        </p>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
        {/* §9.1 honest disabled pill — Phase 4/5 wires scheduling */}
        <button
          type="button"
          disabled
          className="btn btn-secondary btn-undone"
          style={pill('secondary')}
          title="Coming in a later update"
        >
          Schedule ▾
        </button>
        <RunAllButton mutation={mutation} />
      </div>
    </div>
  )

  /* §14.3 empty: "No runs yet" with the Run-all pill still present. */
  if (data.steps?.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md2)' }}>
        {header}
        <div style={card()}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 'var(--space-sm2)',
              padding: 'var(--space-xl2) var(--space-md)',
            }}
          >
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
            <h2
              style={{
                margin: 0,
                fontSize: tokens.type.heading.size,
                lineHeight: tokens.type.heading.lh,
                fontWeight: 700,
                letterSpacing: '-0.3px',
                color: 'var(--color-ink)',
              }}
            >
              No runs yet
            </h2>
            <p style={BODY}>The first 6am run writes itself here. You can also trigger one.</p>
            <RunAllButton mutation={mutation} />
          </div>
        </div>
      </div>
    )
  }

  const okCount = data.steps.filter((s) => s.status === 'ok').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md2)' }}>
      {header}

      <div style={card()}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-sm)',
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: tokens.type.heading.size,
              lineHeight: tokens.type.heading.lh,
              fontWeight: 700,
              letterSpacing: '-0.3px',
              color: 'var(--color-ink)',
            }}
          >
            Last night, 14 Aug
          </h3>
          <span style={statusPill('done')}>
            {okCount} of {data.steps.length} clean
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: stepGrid(isPhone), gap: 'var(--space-sm2)' }}>
          {data.steps.map((step) => (
            <StepCard key={step.n} step={step} />
          ))}
        </div>
      </div>

      {/* §12 row 11: desktop = ladder + 400px log side-by-side (D-05
          proportions kept); tablet/phone = log drops BELOW full-width. */}
      <div
        style={{
          display: 'flex',
          flexDirection: viewport === 'desktop' ? 'row' : 'column',
          gap: 'var(--space-md2)',
          alignItems: 'stretch',
        }}
      >
        <div style={{ ...card(), flex: viewport === 'desktop' ? 1.4 : 'none', minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-sm)',
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: tokens.type.heading.size,
                lineHeight: tokens.type.heading.lh,
                fontWeight: 700,
                letterSpacing: '-0.3px',
                color: 'var(--color-ink)',
              }}
            >
              Where your rows are right now
            </h3>
            <span style={CAPTION}>status ladder</span>
          </div>

          {/* The axis swap is a structural change — the sanctioned
              useViewport branch (02-RESEARCH Pattern 3 rung 4). */}
          {viewport === 'desktop' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              {RUNGS.map((rung, i) => (
                <Fragment key={rung.label}>
                  {i > 0 && <LadderArrow dir="→" />}
                  <RungTile rung={rung} desktop />
                </Fragment>
              ))}
            </div>
          ) : viewport === 'tablet' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-sm2)' }}>
              {RUNGS.map((rung, i) => (
                <div
                  key={rung.label}
                  style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', minWidth: 0 }}
                >
                  <RungTile rung={rung} />
                  {i < 2 && <LadderArrow dir="↓" style={{ alignSelf: 'center' }} />}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
              {RUNGS.map((rung, i) => (
                <Fragment key={rung.label}>
                  {i > 0 && <LadderArrow dir="↓" style={{ alignSelf: 'center' }} />}
                  <RungTile rung={rung} />
                </Fragment>
              ))}
            </div>
          )}

          <div style={{ height: 1, background: 'var(--color-divider)', margin: 'var(--space-xs) 0' }}></div>

          {/* "failed rows" banner — danger-text on danger-tint (§7.2); the row
              wraps on phone (full-width, no fixed widths). Retry all is the
              §9.1 danger-soft pill, honestly disabled until Phase 5. */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-sm2)',
              background: 'var(--color-danger-tint)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-md)',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: tokens.type.body.size,
                  lineHeight: tokens.type.body.lh,
                  fontWeight: 700,
                  color: 'var(--color-danger-text)',
                }}
              >
                13 rows sat at failed
              </div>
              <div style={{ ...CAPTION, color: 'var(--color-danger-text)', marginTop: 'var(--space-xs)' }}>
                11 paywalls, 1 timeout, 1 transcript unavailable
              </div>
            </div>
            <button
              type="button"
              disabled
              className="btn btn-danger btn-undone"
              style={pill('danger')}
              title="Coming in a later update"
            >
              Retry all
            </button>
          </div>

          {/* "new subject" banner — surface-tint; Rename/Keep honestly disabled */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-sm2)',
              background: 'var(--color-surface-tint)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-md)',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: tokens.type.body.size,
                  lineHeight: tokens.type.body.lh,
                  fontWeight: 700,
                  color: 'var(--color-ink)',
                }}
              >
                New subject created: "Pricing"
              </div>
              <div style={{ ...CAPTION, marginTop: 'var(--space-xs)' }}>
                Rename it now — subject names become notebook names
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
              <button
                type="button"
                disabled
                className="btn btn-secondary btn-undone"
                style={pill('secondary')}
                title="Coming in a later update"
              >
                Rename
              </button>
              <button
                type="button"
                disabled
                className="btn btn-secondary btn-undone"
                style={pill('secondary')}
                title="Coming in a later update"
              >
                Keep
              </button>
            </div>
          </div>
        </div>

        {/* Run log — §9.2 dark ink card; entries mono Caption 12 (§6);
            timestamps on-dark-faint; lime/danger-bright highlights tokenized.
            Copy log / Open skill are honest disabled ghosts; the on-dark class
            swaps their focus ring to lime (§10). */}
        <div
          style={{
            ...card({ dark: true }),
            flex: viewport === 'desktop' ? 1 : 'none',
            maxWidth: viewport === 'desktop' ? 400 : 'none',
            minWidth: 0,
            color: '#fff',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-sm)',
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: tokens.type.heading.size,
                lineHeight: tokens.type.heading.lh,
                fontWeight: 700,
                letterSpacing: '-0.3px',
              }}
            >
              Run log
            </h3>
            <span style={{ ...CAPTION, fontFamily: tokens.type.mono, color: 'var(--color-on-dark-faint)' }}>
              {data.lastRunAt}
            </span>
          </div>
          <div
            style={{
              fontFamily: tokens.type.mono,
              fontSize: tokens.type.caption.size,
              lineHeight: 2,
              color: 'var(--color-on-dark-secondary)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {data.runLog.map((entry, i) => (
              <RunLogLine key={i} entry={entry} />
            ))}
          </div>
          <div
            style={{
              marginTop: 'auto',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-sm)',
              paddingTop: 'var(--space-sm)',
            }}
          >
            <button
              type="button"
              disabled
              className="btn btn-ghost btn-undone on-dark"
              style={pill('ghost')}
              title="Coming in a later update"
            >
              Copy log
            </button>
            <button
              type="button"
              disabled
              className="btn btn-ghost btn-undone on-dark"
              style={pill('ghost')}
              title="Coming in a later update"
            >
              Open skill
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
