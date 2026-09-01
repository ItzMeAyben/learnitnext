'use client'

import { useViewport } from '../lib/tokens.js'
import TopNav from './TopNav.js'
import PhoneHeader from './PhoneHeader.js'
import TabBar from './TabBar.js'

// Shared dashboard chrome (02-02, reworked responsive in 02-08): canvas
// wrapper + centered 1440px column + responsive nav. Used by the (dashboard)
// group layout AND the onboarded branch of the adaptive `/` (app/page.js) so
// both render identical chrome; the server parents render this client shell
// unchanged (composition direction per 02-RESEARCH Pattern 4 + Next docs).
//
// DOM order is the a11y contract (UI-SPEC §11.2/§11.3):
//   1. skip-link  — first tab stop, hidden until focused (.skip-link class)
//   2. TopNav     — header landmark, class-hidden display:none below 768px
//   3. PhoneHeader— phone-only 56px inline header (renders null ≥768)
//   4. main       — the one content landmark (#main-content)
//   5. TabBar     — LAST child, after <main>: tab order reads content → nav
export default function AppShell({ children }) {
  const viewport = useViewport()

  // D-05: desktop keeps Phase-1 proportions verbatim; tablet/phone absorb to
  // the §4 scale. Phone additionally clears the fixed 56px tab bar — fixed
  // elements don't push flow, so the padding does it (02-RESEARCH Pitfall 6).
  const padding =
    viewport === 'phone'
      ? 'var(--space-md) var(--space-md) calc(72px + env(safe-area-inset-bottom))'
      : viewport === 'tablet'
        ? 'var(--space-md2) var(--space-md)'
        : '26px 30px 40px'

  return (
    <div style={{ background: 'var(--color-canvas)', minHeight: '100vh' }}>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding, display: 'flex', flexDirection: 'column', gap: 'var(--space-md2)' }}>
        <TopNav />
        <PhoneHeader />
        <main id="main-content" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md2)', minWidth: 0 }}>
          {children}
        </main>
      </div>
      <TabBar />
    </div>
  )
}
