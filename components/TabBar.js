'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Phone bottom tab bar (D-05, UI-SPEC §9.4/§12). Five destinations mirroring
// TopNav's TABS verbatim — same labels, same hrefs, same match semantics
// (D-11: this changes HOW nav renders per width, never WHERE it goes).
// The component ALWAYS renders; the .tabbar class in app/globals.css hides
// it ≥768px with display:none, which also removes it from the a11y tree
// (§11.3) — so exactly one "Primary" nav landmark is ever exposed.
// Rendered as the LAST child of the screen wrapper (after <main>) so tab
// order reads content → nav (§11.2, 02-RESEARCH Pattern 4).

// Mirrors TopNav.js TABS byte-for-byte — do not let the two drift.
const TABS = [
  { label: 'Today', to: '/', match: (p) => p === '/' },
  { label: 'Subjects', to: '/subjects', match: (p) => p.startsWith('/subjects') },
  { label: 'Listen', to: '/listen', match: (p) => p.startsWith('/listen') },
  { label: 'Library', to: '/library', match: (p) => p.startsWith('/library') },
  { label: 'Pipeline', to: '/pipeline', match: (p) => p.startsWith('/pipeline') },
]

// Hand-written inline SVGs (UI-SPEC §1 — no icon package): 24px,
// currentColor, stroke-width 1.8, simple geometric paths that read at 24px.
const ICONS = {
  '/': (
    // Today — house
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 11.4 12 4.6l8 6.8" />
      <path d="M6 10.2v9.2h12v-9.2" />
      <path d="M10 19.4v-4.6h4v4.6" />
    </svg>
  ),
  '/subjects': (
    // Subjects — grid of 4 squares
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="4" width="6.6" height="6.6" rx="1.6" />
      <rect x="13.4" y="4" width="6.6" height="6.6" rx="1.6" />
      <rect x="4" y="13.4" width="6.6" height="6.6" rx="1.6" />
      <rect x="13.4" y="13.4" width="6.6" height="6.6" rx="1.6" />
    </svg>
  ),
  '/listen': (
    // Listen — headphones
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 14.5V12a8 8 0 0 1 16 0v2.5" />
      <rect x="3.2" y="14" width="4.6" height="6.2" rx="1.8" />
      <rect x="16.2" y="14" width="4.6" height="6.2" rx="1.8" />
    </svg>
  ),
  '/library': (
    // Library — stacked books
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="4.2" width="14" height="4.6" rx="1.5" />
      <rect x="5" y="9.7" width="14" height="4.6" rx="1.5" />
      <rect x="5" y="15.2" width="14" height="4.6" rx="1.5" />
    </svg>
  ),
  '/pipeline': (
    // Pipeline — arrow flow: nodes + connecting line
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="4.6" cy="12" r="2.2" />
      <circle cx="19.4" cy="12" r="2.2" />
      <path d="M6.8 12h4" />
      <path d="M11.4 9.9l2.2 2.1-2.2 2.1" />
      <path d="M13.6 12h3.6" />
    </svg>
  ),
}

export default function TabBar() {
  const pathname = usePathname()
  return (
    <nav className="tabbar" aria-label="Primary">
      {/* Inner flex row — the .tabbar class owns the bar's fixed positioning
          and breakpoint visibility; this div only distributes the items. */}
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'stretch', width: '100%' }}>
        {TABS.map((tab) => (
          <Link
            key={tab.label}
            href={tab.to}
            className="tabbar-item"
            aria-current={tab.match(pathname) ? 'page' : undefined}
            style={{ textDecoration: 'none' }}
          >
            {/* State colors/weight come from the class layer (ownership rule) —
                never set background/color inline on .tabbar-item carriers. */}
            <span className="tabbar-indicator" aria-hidden="true" />
            {ICONS[tab.to]}
            <span>{tab.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
