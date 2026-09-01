'use client'

import { usePathname } from 'next/navigation'
import { useViewport } from '../lib/tokens.js'

// Slim 56px phone inline header (D-05, UI-SPEC §12 common chrome): logo mark
// + screen title, shown ONLY below 768px where the TopNav is display:none.
// The title comes from a hardcoded pathname→string map (never the URL value
// itself — threat model T-02-08-01); unknown paths render ''.
const TITLES = [
  { title: 'Today', match: (p) => p === '/' },
  { title: 'Subjects', match: (p) => p.startsWith('/subjects') },
  { title: 'Listen', match: (p) => p.startsWith('/listen') },
  { title: 'Library', match: (p) => p.startsWith('/library') },
  { title: 'Pipeline', match: (p) => p.startsWith('/pipeline') },
  { title: 'Quiz', match: (p) => p.startsWith('/quiz') },
  { title: 'Pathway', match: (p) => p.startsWith('/pathway') },
  { title: 'Session', match: (p) => p.startsWith('/session') },
]

export default function PhoneHeader() {
  const pathname = usePathname()
  const viewport = useViewport()

  // Structural swap (02-RESEARCH Pattern 3 rung 4): the header↔TopNav swap
  // changes DOM shape, so JS branching is sanctioned here. SSR renders the
  // phone snapshot; the useViewport correction after mount removes this
  // header on ≥768px (TopNav's class already handles the other direction).
  if (viewport !== 'phone') return null

  const title = TITLES.find((t) => t.match(pathname))?.title ?? ''

  return (
    <header
      style={{
        minHeight: 56,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        padding: '0 var(--space-md)',
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-divider)',
      }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 'var(--radius-sm)',
          background: 'var(--color-ink)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 13,
          fontWeight: 700,
          flex: 'none',
        }}
      >
        L
      </div>
      <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-ink)' }}>{title}</span>
    </header>
  )
}
