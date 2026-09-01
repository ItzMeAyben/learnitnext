import Link from 'next/link'

// 404 joined to the visual system (D-08, UI-SPEC §12 row 12): token-styled
// 420px card (full-width with clamp gutters on phone), Primary/Ghost button
// pair that stacks under ~360px content width. STAYS a server component —
// no client directive is added. It renders for unknown routes AND for client
// notFound() calls (unknown subjects, unknown pathways).
//
// Token VALUES arrive via the CSS custom properties app/globals.css mirrors
// from lib/tokens.js — a JS import of lib/tokens.js is impossible in a
// Server Component on Next 16.3.1 (the module transitively exports
// useSyncExternalStore hooks, which the react-server build rejects; see
// .planning/phases/02-ui-design-responsive-overhaul/deferred-items.md #2).
// The PILL_* constants inline the same layout-only properties pill()
// returns; resting/hover colors are owned by the .btn-* classes.

const PILL_PRIMARY = {
  minHeight: 44,
  borderRadius: 'var(--radius-pill)',
  fontSize: 14,
  fontWeight: 700,
  padding: '12px 24px',
}

const PILL_GHOST = {
  minHeight: 44,
  borderRadius: 'var(--radius-pill)',
  fontSize: 14,
  fontWeight: 700,
  padding: '12px 20px',
}

export default function NotFound() {
  return (
    <div
      style={{
        background: 'var(--color-canvas)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-xxl)',
          padding: 'var(--space-lg)',
          width: '100%',
          maxWidth: 420,
          margin: 'clamp(16px, 4vw, 40px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-sm2)',
          textAlign: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-ink)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            fontWeight: 700,
            margin: '0 auto',
          }}
        >
          L
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: '-1px',
            lineHeight: 1.15,
            color: 'var(--color-ink)',
          }}
        >
          Nothing here
        </h1>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: 'var(--color-text-secondary)' }}>
          This screen does not exist — the link may be old, or the subject was renamed.
        </p>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-sm)',
            justifyContent: 'center',
            marginTop: 'var(--space-xs)',
            width: '100%',
          }}
        >
          <Link href="/" className="btn btn-primary" style={{ ...PILL_PRIMARY, flex: '1 1 160px' }}>
            Back to Today
          </Link>
          <Link href="/subjects" className="btn btn-ghost" style={{ ...PILL_GHOST, flex: '1 1 160px' }}>
            Browse subjects
          </Link>
        </div>
      </div>
    </div>
  )
}
