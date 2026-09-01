'use client'

import { useState } from 'react'
import Link from 'next/link'
import { notFound, useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { tokens, pill, card, GLYPHS, useViewport } from '../../../../lib/tokens.js'

// Pathway (UI-SPEC §12 row 6): token-styled hero + snap-scrolling subject chips
// + a vertical timeline whose dot rail shrinks on phone (64px/14px dots →
// 28px/12px dots) and whose 300px right rail drops BELOW the stages under
// 1024px (the one structural swap — useViewport). The Phase 1 reorder arrows
// become labeled 44px buttons on every width ("Move up"/"Move down" Ghost
// pills on phone, §10 touch targets). Phase 1 wires (D-11) are byte-identical:
// every encoded href (breadcrumb, print, listen, chips, quiz hop, empty-state
// back link), the per-subject `orders` state, the #active-stage id + reduced-
// motion-aware scrollIntoView (02-09 links /pathway/{id}#active-stage), and
// the notFound() guard. Checklist copy stays mock — realism is Phase 3.

async function fetchSubjects() {
  const res = await fetch('/api/subjects')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
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

// §10 touch targets: the desktop/tablet compact reorder glyphs are real
// labeled 44×44 buttons (never 24×20 spans). No state class on them, so the
// inline surface-tint background is ownership-rule safe.
const ARROW_BUTTON = {
  width: tokens.touch,
  height: tokens.touch,
  border: 0,
  borderRadius: 'var(--radius-sm)',
  background: 'var(--color-surface-tint)',
  color: 'var(--color-text-secondary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 10,
  cursor: 'pointer',
}

// §9.2 checklist rows: surface-tint, r-md, Body text; the in-flight row uses
// accent-tint + accent-text; the locked row carries no surface.
const CHECK_ROW = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-sm2)',
  padding: 'var(--space-sm2)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-surface-tint)',
}

function decorateStage(raw, index, moveUp, moveDown) {
  const isDone = raw.status === 'done'
  const isActive = raw.status === 'active'
  const isLocked = raw.status === 'locked'
  return {
    title: raw.title,
    desc: raw.desc,
    isActive,
    opacity: isLocked ? 0.55 : isDone ? 0.7 : 1,
    border: isActive ? '1.5px solid var(--color-accent)' : 'none',
    icon: isDone ? GLYPHS.check : isLocked ? '🔒' : String(index + 1),
    iconBg: isDone ? 'var(--color-success-tint)' : isLocked ? 'var(--color-surface-sunken)' : 'var(--color-accent-tint)',
    iconFg: isDone ? 'var(--color-success-text)' : isLocked ? 'var(--color-text-faint)' : 'var(--color-accent)',
    badge: isActive ? 'IN PROGRESS' : '',
    action: isDone ? 'Review' : isActive ? 'Continue' : 'Locked',
    isLocked,
    showChecklist: isActive,
    moveUp,
    moveDown,
  }
}

// #active-stage anchor machinery (§10 reduced-motion row): the 02-09 Today
// hero deep-links /pathway/{id}#active-stage, and both "Continue" controls
// scroll here — instantly under prefers-reduced-motion, smoothly otherwise.
function scrollToActiveStage() {
  document
    .getElementById('active-stage')
    ?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}

export default function PathwayPage() {
  const { subjectId } = useParams()
  const viewport = useViewport()
  const isPhone = viewport === 'phone'
  let name = ''
  try {
    name = decodeURIComponent(subjectId)
  } catch {
    name = ''
  }
  const { data: subjects, isError, refetch } = useQuery({ queryKey: ['subjects'], queryFn: fetchSubjects })
  const subject = subjects?.find((s) => s.id === name)
  const [orders, setOrders] = useState({})

  if (!name || (subjects && !subject)) notFound()
  if (isError) {
    return (
      <div role="alert" style={{ ...card(), flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
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
        <span style={SR_ONLY}>Laying out your reading path…</span>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ height: 112, borderRadius: 'var(--radius-xl)' }} />
        ))}
      </div>
    )
  }
  if (subject.stages?.length === 0) {
    return (
      <div style={{ ...card(), alignItems: 'center', textAlign: 'center', gap: 'var(--space-sm2)', padding: 'var(--space-xl2) var(--space-md)' }}>
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
          {GLYPHS.guide}
        </div>
        <div style={{ fontSize: tokens.type.heading.size, lineHeight: tokens.type.heading.lh, fontWeight: 700, letterSpacing: '-0.3px', color: 'var(--color-ink)' }}>Pathway not built yet</div>
        <p style={{ ...BODY, maxWidth: 340 }}>This subject needs a couple more sources before its stages lock in.</p>
        <Link href={`/subjects/${encodeURIComponent(subject.id)}`} className="btn btn-link" style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>
          Back to subject →
        </Link>
      </div>
    )
  }

  const activeOrder = orders[subject.id] ?? subject.stages.map((_, i) => i)
  const orderedRaw = activeOrder.map((i) => subject.stages[i])
  const doneCount = orderedRaw.filter((s) => s.status === 'done').length
  const pct = Math.round((doneCount / orderedRaw.length) * 100)

  function moveStage(i, dir) {
    const j = i + dir
    if (j < 0 || j >= activeOrder.length) return
    const next = activeOrder.slice()
    ;[next[i], next[j]] = [next[j], next[i]]
    setOrders((prev) => ({ ...prev, [subject.id]: next }))
  }

  const stages = orderedRaw.map((s, i) => decorateStage(s, i, () => moveStage(i, -1), () => moveStage(i, 1)))
  const dots = orderedRaw.map((s, i) => ({
    color: s.status === 'done' ? 'var(--color-success)' : s.status === 'active' ? 'var(--color-accent)' : 'var(--color-border)',
    hasLine: i < orderedRaw.length - 1,
    lineColor: s.status === 'done' && orderedRaw[i + 1] && orderedRaw[i + 1].status !== 'locked' ? 'var(--color-success)' : 'var(--color-border-strong)',
  }))

  // §12 row 6 rail metrics: 64px rail / 14px dots / 3px connectors on
  // desktop+tablet; 28px / 12px / 2px on phone.
  const rail = isPhone ? { rail: 28, dot: 12, line: 2 } : { rail: 64, dot: 14, line: 3 }

  // Right rail (builds-from + certificate): 300px beside the stages on
  // desktop, below the stage list on tablet/phone — same JSX either way.
  const railCards = (
    <>
      <div style={card()}>
        <span style={{ fontSize: tokens.type.heading.size, lineHeight: tokens.type.heading.lh, fontWeight: 700, letterSpacing: '-0.3px', color: 'var(--color-ink)' }}>This stage builds from</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm2)' }}>
          <div aria-hidden="true" style={{ width: 32, height: 22, borderRadius: 'var(--radius-sm)', background: 'var(--color-surface-sunken)', flex: 'none' }} />
          <span style={{ fontSize: tokens.type.body.size, color: 'var(--color-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subject.source1}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm2)' }}>
          <div aria-hidden="true" style={{ width: 32, height: 22, borderRadius: 'var(--radius-sm)', background: 'var(--color-surface-sunken)', flex: 'none' }} />
          <span style={{ fontSize: tokens.type.body.size, color: 'var(--color-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subject.source2}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm2)' }}>
          <div aria-hidden="true" style={{ width: 32, height: 22, borderRadius: 'var(--radius-sm)', background: 'var(--color-surface-sunken)', flex: 'none' }} />
          <span style={{ fontSize: tokens.type.body.size, color: 'var(--color-ink)' }}>+{subject.moreSourcesCount} more sources</span>
        </div>
      </div>
      <div style={{ ...card({ dark: true }), color: '#fff', gap: 'var(--space-sm)' }}>
        <span style={{ fontSize: tokens.type.body.size, fontWeight: 700 }}>Certificate on completion</span>
        <p style={{ ...BODY, color: 'var(--color-on-dark-secondary)' }}>Finish all {orderedRaw.length} stages and pass each quiz to unlock a completion note for this subject.</p>
        <div style={{ height: 6, borderRadius: 999, background: 'var(--color-on-color-chip)', overflow: 'hidden', marginTop: 2 }}>
          <div style={{ width: `${pct}%`, height: '100%', background: 'var(--color-lime)', borderRadius: 999 }} />
        </div>
      </div>
    </>
  )

  // Action pills wrap to full-width rows on phone (§12 row 6 via the hero
  // "action pills wrap to full width" rule).
  const actionFlex = isPhone ? { flex: '1 1 100%', textAlign: 'center' } : undefined

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-xs)', fontSize: tokens.type.caption.size }}>
          <Link href="/subjects" className="crumb-link" style={CRUMB}>
            Subjects
          </Link>
          <span aria-hidden="true" style={{ ...CAPTION, color: 'var(--color-text-faint)' }}>/</span>
          <Link href={`/subjects/${encodeURIComponent(subject.id)}`} className="crumb-link" style={CRUMB}>
            {subject.id}
          </Link>
          <span aria-hidden="true" style={{ ...CAPTION, color: 'var(--color-text-faint)' }}>/</span>
          <span style={{ ...CRUMB, color: 'var(--color-ink)', fontWeight: 700 }}>Pathway</span>
        </nav>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
          <Link href={`/pathway/${encodeURIComponent(subject.id)}/print`} className="btn btn-secondary" style={{ ...pill('secondary'), ...actionFlex }}>
            ⎙ Print / export
          </Link>
          <Link href={`/listen?subject=${encodeURIComponent(subject.id)}`} className="btn btn-secondary" style={{ ...pill('secondary'), ...actionFlex }}>
            ♪ Switch to Listen
          </Link>
          <button type="button" className="btn btn-primary" style={{ ...pill('primary'), ...actionFlex }} onClick={scrollToActiveStage}>
            Continue where you left off
          </button>
        </div>
      </div>

      {/* §12 row 6: chips scroll-snap INSIDE their container on phone — the
          page itself never scrolls sideways. Active chip = ink, others =
          surface (inline is sanctioned: chips carry no state class). */}
      <div className="scroll-snap-x">
        {subjects.map((s) => (
          <Link
            key={s.id}
            href={`/pathway/${encodeURIComponent(s.id)}`}
            className="snap-item"
            style={{
              background: s.id === subject.id ? 'var(--color-ink)' : 'var(--color-surface)',
              color: s.id === subject.id ? '#fff' : 'var(--color-ink)',
              border: '1px solid transparent',
              borderColor: s.id === subject.id ? 'transparent' : 'var(--color-border)',
              borderRadius: 999,
              padding: '12px 20px',
              fontSize: tokens.type.body.size,
              fontWeight: 700,
              minHeight: tokens.touch,
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            {s.id}
          </Link>
        ))}
      </div>

      {/* §9.10 hero: subject-color bg r-2xl, xl padding desktop / md phone;
          stats move below the copy on phone (useViewport rung-4 swap). Lime
          progress fill on colored tiles (§9.11). */}
      <section
        style={{
          background: subject.color,
          borderRadius: 'var(--radius-xxl)',
          padding: isPhone ? 'var(--space-md)' : 'var(--space-xl)',
          color: tokens.color.surface,
          display: 'flex',
          flexDirection: isPhone ? 'column' : 'row',
          alignItems: isPhone ? 'stretch' : 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-lg)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', minWidth: 0 }}>
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
            READING PATH · {orderedRaw.length} STAGES
          </span>
          <h1 style={{ margin: 0, fontSize: tokens.type.display.size, lineHeight: tokens.type.display.lh, fontWeight: 700, letterSpacing: '-1px' }}>{subject.id}</h1>
          <p style={{ ...BODY, color: 'var(--color-on-color-soft)', maxWidth: 520 }}>{subject.blurb}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: isPhone ? 'flex-start' : 'flex-end', gap: 'var(--space-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
            <span style={{ fontSize: tokens.type.display.size, lineHeight: 1, fontWeight: 700, letterSpacing: '-1px' }}>{doneCount} / {orderedRaw.length}</span>
            <span style={{ ...CAPTION, color: 'var(--color-on-color-soft)' }}>stages done</span>
          </div>
          <div style={{ width: isPhone ? '100%' : 220, maxWidth: 220, height: 6, borderRadius: 999, background: 'var(--color-on-color-chip)', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'var(--color-lime)', borderRadius: 999 }} />
          </div>
        </div>
      </section>

      {/* Timeline + rail: desktop renders the rail beside the stages; tablet
          and phone render it below (§12 row 6). The dot rail itself shrinks on
          phone via the rail metrics above. */}
      <div style={{ display: 'flex', flexDirection: viewport === 'desktop' ? 'row' : 'column', gap: 'var(--space-md2)', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', alignItems: 'stretch', minWidth: 0, flex: viewport === 'desktop' ? '1 1 auto' : 'auto' }}>
          <div aria-hidden="true" style={{ width: rail.rail, flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 0' }}>
            {dots.map((d, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: d.hasLine ? 1 : 'none' }}>
                <div style={{ width: rail.dot, height: rail.dot, borderRadius: '50%', background: d.color, flex: 'none' }} />
                {d.hasLine && <div style={{ flex: 1, width: rail.line, background: d.lineColor, borderRadius: 2, minHeight: 20 }} />}
              </div>
            ))}
          </div>

          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-md2)' }}>
            {stages.map((stage) => (
              <div
                key={stage.title}
                id={stage.showChecklist ? 'active-stage' : undefined}
                style={{
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-xl)',
                  padding: stage.isActive ? 'var(--space-lg)' : 'var(--space-md2) var(--space-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-md)',
                  opacity: stage.opacity,
                  border: stage.border,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm2)', flexWrap: 'wrap' }}>
                  <div
                    aria-hidden="true"
                    style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: stage.iconBg, color: stage.iconFg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flex: 'none', fontWeight: 700 }}
                  >
                    {stage.icon}
                  </div>
                  <div style={{ flex: '1 1 140px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: tokens.type.heading.size, lineHeight: tokens.type.heading.lh, fontWeight: 700, letterSpacing: '-0.3px', color: 'var(--color-ink)' }}>{stage.title}</span>
                      {stage.badge && (
                        <span style={{ background: 'var(--color-accent-tint)', color: 'var(--color-accent-text)', borderRadius: 999, padding: '4px 10px', fontSize: tokens.type.caption.size, fontWeight: 700 }}>{stage.badge}</span>
                      )}
                    </div>
                    <div style={{ ...CAPTION, marginTop: 2 }}>{stage.desc}</div>
                  </div>
                  {!isPhone && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 'none' }}>
                      <button type="button" aria-label="Move stage up" onClick={stage.moveUp} style={ARROW_BUTTON}>
                        <span aria-hidden="true">▲</span>
                      </button>
                      <button type="button" aria-label="Move stage down" onClick={stage.moveDown} style={ARROW_BUTTON}>
                        <span aria-hidden="true">▼</span>
                      </button>
                    </div>
                  )}
                  {stage.action === 'Review' ? (
                    <Link href={`/quiz?subject=${encodeURIComponent(subject.id)}`} className="btn btn-ghost" style={{ ...pill('ghost'), flex: 'none' }}>
                      {stage.action}
                    </Link>
                  ) : stage.action === 'Continue' ? (
                    <button type="button" className="btn btn-ghost" style={{ ...pill('ghost'), flex: 'none' }} onClick={scrollToActiveStage}>
                      {stage.action}
                    </button>
                  ) : (
                    <span style={{ background: 'var(--color-surface-sunken)', color: 'var(--color-text-faint)', borderRadius: 999, padding: '12px 20px', fontSize: tokens.type.body.size, fontWeight: 700, flex: 'none' }}>{stage.action}</span>
                  )}
                </div>
                {isPhone && (
                  <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                    <button type="button" className="btn btn-ghost" style={{ ...pill('ghost'), width: '100%', flex: 1 }} onClick={stage.moveUp}>
                      Move up
                    </button>
                    <button type="button" className="btn btn-ghost" style={{ ...pill('ghost'), width: '100%', flex: 1 }} onClick={stage.moveDown}>
                      Move down
                    </button>
                  </div>
                )}
                {stage.showChecklist && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                    <div style={{ height: 6, borderRadius: 999, background: 'var(--color-surface-sunken)', overflow: 'hidden' }}>
                      <div style={{ width: '44%', height: '100%', background: 'var(--color-accent)', borderRadius: 999 }} />
                    </div>
                    <div style={CHECK_ROW}>
                      <span aria-hidden="true" style={{ color: 'var(--color-success)', fontSize: tokens.type.body.size }}>✓</span>
                      <span style={{ flex: 1, fontSize: tokens.type.body.size, color: 'var(--color-ink)' }}>Read the briefing doc</span>
                      <span style={CAPTION}>6 min</span>
                    </div>
                    <div style={CHECK_ROW}>
                      <span aria-hidden="true" style={{ color: 'var(--color-success)', fontSize: tokens.type.body.size }}>✓</span>
                      <span style={{ flex: 1, fontSize: tokens.type.body.size, color: 'var(--color-ink)' }}>Read the core sections</span>
                      <span style={CAPTION}>11 min</span>
                    </div>
                    <div style={{ ...CHECK_ROW, background: 'var(--color-accent-tint)' }}>
                      <span aria-hidden="true" style={{ color: 'var(--color-accent)', fontSize: tokens.type.body.size }}>▶</span>
                      <span style={{ flex: 1, fontSize: tokens.type.body.size, color: 'var(--color-ink)', fontWeight: 700 }}>Read the remaining sections</span>
                      <span style={{ ...CAPTION, color: 'var(--color-accent-text)', fontWeight: 700 }}>8 min</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm2)', padding: 'var(--space-sm2)' }}>
                      <span aria-hidden="true" style={{ color: 'var(--color-text-faint)', fontSize: tokens.type.body.size }}>○</span>
                      <span style={{ flex: 1, fontSize: tokens.type.body.size, color: 'var(--color-text-faint)' }}>Take the stage quiz · 6 questions</span>
                      <span style={{ ...CAPTION, color: 'var(--color-text-faint)' }}>locked</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {viewport === 'desktop' ? (
          <aside style={{ width: 300, flex: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-md2)' }}>{railCards}</aside>
        ) : (
          railCards
        )}
      </div>
    </div>
  )
}
