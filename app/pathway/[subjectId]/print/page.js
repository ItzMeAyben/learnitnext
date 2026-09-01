import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSubjectById } from '../../../../lib/store.js'

// Print/export sheet (UI-SPEC §12 row 13, D-08) — the document view joins the
// visual system. STYLING-ONLY change: the data flow is the Phase 1 wire
// byte-for-byte (await params → decode try/catch → notFound(), getSubjectById
// → notFound(), the encoded "← Back to pathway" href, the exported date).
//
// Token sourcing: this page is a SERVER component, and lib/tokens.js cannot be
// imported from the server module graph — that module pulls useSyncExternalStore
// (client-only React API) for useMediaQuery/useViewport, which fails `next
// build` the moment a Server Component reaches it. Token VALUES therefore
// arrive the other, equally canonical way (02-01's two-halves system): colors
// via the :root custom properties mirrored 1:1 from lib/tokens.js
// (var(--color-*) below), and the §6 type roles spelled at their token values
// (Caption 12/1.4, Body 14/1.55, Heading 20/1.3/-0.3, Display 32/1.15/-1).
// @media print behavior lives in the globals.css class layer: .no-print hides
// the back link, .print-row keeps stage rows unbroken across page breaks,
// body prints white.

const DOT_STYLE = {
  done: { color: 'var(--color-success)', mark: '✓' },
  active: { color: 'var(--color-accent)', mark: '●' },
  locked: { color: 'var(--color-text-faint)', mark: '○' },
}

// §6 type roles at their lib/tokens.js values (see header comment for why the
// JS mirror itself can't cross the server boundary).
const CAPTION = {
  fontSize: 12,
  lineHeight: 1.4,
  color: 'var(--color-text-secondary)',
}

const BODY = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.55,
  color: 'var(--color-text-secondary)',
}

export default async function PathwayPrintPage({ params }) {
  const { subjectId } = await params
  let name
  try {
    name = decodeURIComponent(subjectId)
  } catch {
    notFound()
  }
  const subject = getSubjectById(name)
  if (!subject) notFound()
  const doneCount = subject.stages.filter((s) => s.status === 'done').length
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div style={{ background: 'var(--color-canvas-deep)', minHeight: '100vh', padding: 'clamp(16px, 4vw, 40px)' }}>
      <Link
        href={`/pathway/${encodeURIComponent(subject.id)}`}
        className="no-print"
        style={{ minHeight: 44, marginBottom: 12, padding: '12px 0', fontSize: 14, color: 'var(--color-text-secondary)', textDecoration: 'none' }}
      >
        ← Back to pathway
      </Link>
      <div
        style={{
          width: 960,
          maxWidth: '100%',
          margin: '0 auto',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: 'clamp(16px, 6vw, 48px) clamp(16px, 6vw, 56px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-sm)', borderBottom: '2px solid var(--color-ink)', paddingBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 24, height: 24, borderRadius: 'var(--radius-sm)', background: 'var(--color-ink)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>L</div>
            <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px', color: 'var(--color-ink)' }}>LearnIt</span>
          </div>
          <span style={CAPTION}>Exported {today}</span>
        </div>
        <div>
          <span style={{ ...CAPTION, fontWeight: 700, letterSpacing: '0.6px' }}>READING PATHWAY</span>
          <h1 style={{ margin: '8px 0 0', fontSize: 32, lineHeight: 1.15, fontWeight: 700, letterSpacing: '-1px', color: 'var(--color-ink)' }}>{subject.id}</h1>
          <p style={{ ...BODY, margin: '8px 0 0', maxWidth: 640 }}>
            {subject.blurb} Progress at export: {doneCount} of {subject.stages.length} stages complete.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {subject.stages.map((stage) => {
            const style = DOT_STYLE[stage.status]
            return (
              <div key={stage.title} className="print-row" style={{ display: 'flex', gap: 16, padding: '16px 0', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ width: 26, height: 26, borderRadius: 'var(--radius-circle)', border: `2px solid ${style.color}`, color: style.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flex: 'none' }}>
                  {style.mark}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 20, lineHeight: 1.3, fontWeight: 700, letterSpacing: '-0.3px', color: 'var(--color-ink)' }}>{stage.title}</div>
                  <div style={{ ...BODY, marginTop: 3 }}>{stage.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ borderTop: '2px solid var(--color-ink)', paddingTop: 14, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-sm)', fontSize: 12, color: 'var(--color-text-secondary)' }}>
          <span>Generated from your saved sources — for your records, not for redistribution.</span>
          <span>Page 1 of 1</span>
        </div>
      </div>
    </div>
  )
}
