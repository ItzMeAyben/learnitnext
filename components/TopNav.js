'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Icon from './Icon.js'

// Desktop/tablet TopNav (D-05, UI-SPEC §9.4/§12). Tablet-and-up only: the
// .topnav class in app/globals.css sets display:none below 768px and restores
// flex above it — which also drops this header from the a11y tree on phone,
// where the TabBar + PhoneHeader take over (components/TabBar.js).
// OWNERSHIP RULE (02-RESEARCH Pattern 2): the OUTER element carries the class
// for visibility only — an inline display:'flex' here would beat the class's
// display:none. The flex row lives on this inner div instead.

const TABS = [
  { label: 'Today', to: '/', match: (p) => p === '/' },
  { label: 'Subjects', to: '/subjects', match: (p) => p.startsWith('/subjects') },
  { label: 'Listen', to: '/listen', match: (p) => p.startsWith('/listen') },
  { label: 'Library', to: '/library', match: (p) => p.startsWith('/library') },
  { label: 'Pipeline', to: '/pipeline', match: (p) => p.startsWith('/pipeline') },
]

export default function TopNav() {
  const pathname = usePathname()
  return (
    <header className="topnav">
      {/* flex:1 is required, not cosmetic: .topnav is display:flex (above), so
          without it this bar is a shrink-to-fit flex item — the pill stopped
          short of the content column and justify-content:space-between had no
          free space to distribute, collapsing logo/tabs/utilities together. */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-md)', background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: '10px 14px 10px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 'none' }}>
          {/* background/color are class-owned (.topnav-logo), not inline: the
              Listen dark reader re-points them via .theme-dark, and an inline
              declaration would out-rank that (ownership rule above). */}
          <div className="topnav-logo" style={{ width: 26, height: 26, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>L</div>
          {/* Wordmark is .only-desktop (deferred item 1): the Phase-1 logo row
              (tile 26 + wordmark ~85 + track + utilities ≈ 751px) cannot fit
              the 704px available at 768, so tablet compresses to mark-only;
              ≥1024 the full Phase-1 logo idiom renders verbatim (D-05). */}
          <span className="only-desktop topnav-wordmark" style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-.4px' }}>LearnIt</span>
        </div>
        {/* Top nav landmark (§11.3) — the TabBar's <nav aria-label="Primary">
            is the second one; the inactive bar is display:none per breakpoint,
            so exactly one "Primary" nav is ever exposed. */}
        <nav aria-label="Primary" style={{ display: 'flex', gap: 4, background: 'var(--color-surface-sunken)', borderRadius: 'var(--radius-pill)', padding: 4 }}>
          {TABS.map((tab) => {
            const active = tab.match(pathname)
            return (
              <Link
                key={tab.label}
                href={tab.to}
                className="tab-item"
                aria-current={active ? 'page' : undefined}
                style={{ fontSize: 14, textDecoration: 'none' }}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>
        {/* One 40px optical row: the two round slots and the avatar chip were
            36/36/38 with a 14px gap, so nothing lined up against the 44px
            tabs. Same height, same 8px rhythm, same icon size. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flex: 'none' }}>
          {/* Not-yet-wired action (§9.1): Search is a Phase 4 feature — real
              <button>, disabled, NOT dimmed (.btn-undone), tooltip says so. */}
          <button
            type="button"
            disabled
            className="btn btn-undone"
            title="Coming in a later update"
            aria-label="Search"
            style={{ width: 40, height: 40, minHeight: 40, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface-sunken)', color: 'var(--color-text-secondary)' }}
          >
            <Icon name="search" size={18} />
          </button>
          {/* Decorative chrome (no fake affordances — D-11 "no dead spans"):
              notification dot + avatar chip are pure markers, hidden from AT. */}
          <div aria-hidden="true" style={{ width: 40, height: 40, borderRadius: 'var(--radius-circle)', background: 'var(--color-surface-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', position: 'relative' }}>
            <Icon name="bell" size={18} />
            <span style={{ position: 'absolute', top: 9, right: 9, width: 8, height: 8, borderRadius: 'var(--radius-circle)', background: 'var(--color-notify)', border: '2px solid var(--color-surface-sunken)' }}></span>
          </div>
          <div aria-hidden="true" style={{ display: 'flex', alignItems: 'center', gap: 6, height: 40, background: 'var(--color-surface-sunken)', borderRadius: 'var(--radius-pill)', padding: '0 10px 0 4px' }}>
            <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-circle)', background: 'var(--color-border-strong)' }}></div>
            <Icon name="chevronDown" size={14} style={{ color: 'var(--color-text-secondary)' }} />
          </div>
        </div>
      </div>
    </header>
  )
}
