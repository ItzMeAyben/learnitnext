'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { wave } from '../../lib/wave'
import { tokens, pill, useViewport } from '../../lib/tokens'
import TabBar from '../../components/TabBar'
import TopNav from '../../components/TopNav'

// Listen (02-11, UI-SPEC §12 row 8 + §7.5): the app's audio reader, the only
// screen with a kept local light/dark toggle — now reading from the §7.5
// token pairs in lib/tokens.js instead of an ad-hoc hex object (dark pageBg
// IS color.inkDeep, dark secondary text IS color.onDarkSecondary, …).
//
// Layouts (D-05): desktop keeps the Phase-1 3-zone proportions verbatim
// (sidebar 250 / player with the 212px art tile / sections 1.25fr + quote
// 330); tablet keeps the sidebar and stacks sections-over-quote; phone
// (<768) drops the local sidebar entirely — the global TabBar covers
// Today/Subjects/Library/Pipeline with Listen as the active tab — and stacks
// player (140px art tile) → "Up next" chip row → sections → quote, with
// bottom clearance for the fixed bar. Listen lives OUTSIDE the (dashboard)
// group, so this page renders <TabBar/> itself, as the LAST element of the
// tree (02-RESEARCH Pattern 4).
//
// Phase 1 wires survive unchanged (D-11): the five destinations now ride the
// shared TopNav instead of a local sidebar list (same hrefs), "Read
// instead" → /subjects/{subject}, "Quiz me after" → /quiz?subject=…, the
// theme toggle, and the Suspense boundary around useSearchParams (a
// prerendered page calling it must be wrapped or the production build
// fails — see the bundled use-search-params docs).
//
// §14.3 states, for the Phase 3 DATA/AUDIO wiring (unreachable today — this
// screen renders static content, no fetch, so no dead branches are added):
// loading → player + section skeletons + sr-only "Cueing the episode…";
// error → "Couldn't load the episode — check the pipeline." + Retry.

const SECTIONS = [
  { n: '01', title: "What an agent actually is", time: '2:40', state: 'done' },
  { n: '02', title: 'The loop, drawn once', time: '3:05', state: 'done' },
  { n: '03', title: 'Memory: what to keep, what to drop', time: '4:20', state: 'active' },
  { n: '04', title: 'Tool use and its failure modes', time: '3:35', state: 'upcoming' },
  { n: '05', title: 'Evaluation without a benchmark', time: '4:10', state: 'upcoming' },
  { n: '06', title: 'Scheduling and unattended runs', time: '3:15', state: 'upcoming' },
]

const UP_NEXT = [
  { title: 'Distribution', time: '16 min', swatch: '#ffd84d' },
  { title: 'Sales', time: '21 min', swatch: '#12121a' },
  { title: 'Finance', time: '9 min', swatch: '#e9e7f4' },
]

// §6 type-role shortcuts; colors stay at the use site (palette pairs).
const CAPTION = { fontSize: tokens.type.caption.size, lineHeight: tokens.type.caption.lh }
const LIST_RESET = { margin: 0, padding: 0, listStyle: 'none' }
const RAIL_HEAD = {
  ...CAPTION,
  fontWeight: 700,
  letterSpacing: '.6px',
  textTransform: 'uppercase',
}

export default function ListenPage() {
  return (
    <Suspense fallback={null}>
      <ListenScreen />
    </Suspense>
  )
}

function ListenScreen() {
  const subject = useSearchParams().get('subject') ?? 'AI Agents'
  const [theme, setTheme] = useState('light')
  const isDark = theme === 'dark'
  const viewport = useViewport()
  const isPhone = viewport === 'phone'
  const isDesktop = viewport === 'desktop'

  // §7.5: the toggle now flips token pairs instead of an inline hex object.
  const palette = isDark ? tokens.listenDark : tokens.listenLight
  const ghostBtn = isDark ? 'btn btn-ghost on-dark' : 'btn btn-ghost'

  // 96 bars read at desktop widths; the phone player column is ~4× narrower,
  // so it renders 48 (height 64→44 per §12 row 8).
  const waveBars = wave(isPhone ? 48 : 96, 0.34, tokens.color.accent, isDark ? 'rgba(255,255,255,.15)' : '#dedbeb')

  const cardBase = {
    background: palette.cardBg,
    border: `1px solid ${palette.divider}`,
    borderRadius: 'var(--radius-xxl)',
  }

  // §11.3/§11.2: one content landmark, skip link as the first tab stop,
  // TabBar after <main> so tab order reads content → nav.
  const pagePad = isPhone
    ? 'var(--space-md) var(--space-md) calc(72px + env(safe-area-inset-bottom))'
    : isDesktop
      ? '26px 30px 40px'
      : 'var(--space-md2) var(--space-md)'

  // Desktop-only Up-next card. This used to be the lower half of a 250px left
  // sidebar whose upper half was a logo + five nav rows — a second, competing
  // primary nav, and a plain <div> of <Link>s with no landmark and no
  // aria-current, which is why this screen read as "no navbar" next to every
  // other route's TopNav pill. TopNav now carries navigation here too (one
  // Primary nav, D-11 hrefs unchanged) and this card moved to the right rail.
  const upNextRail = (
    <div style={{ ...cardBase, padding: 'var(--space-md2)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm2)' }}>
      <span style={{ ...RAIL_HEAD, color: palette.textFaint }}>UP NEXT</span>
      {UP_NEXT.map((item) => (
        <div key={item.title} style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
          <div aria-hidden="true" style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: item.swatch, flex: 'none' }}></div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: tokens.type.body.size, fontWeight: 700, color: palette.textPrimary }}>{item.title}</div>
            <div style={{ ...CAPTION, color: palette.textSecondary }}>{item.time}</div>
          </div>
        </div>
      ))}
    </div>
  )

  // §7.1: the art tile is one of the accent's reserved uses. It stays a
  // visual (aria-hidden); 212px on desktop, compact 140px tile on tablet and
  // phone with thumbnail-scale type.
  const artTile = (size, titleSize, uppercase) => (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        flex: 'none',
        borderRadius: size >= 200 ? 'var(--radius-xl)' : 'var(--radius-lg)',
        background: tokens.color.accent,
        padding: size >= 200 ? 'var(--space-lg)' : 'var(--space-sm2)',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: '#fff',
        overflow: 'hidden',
      }}
    >
      <span style={{ ...CAPTION, fontWeight: 700, letterSpacing: '.8px', color: 'rgba(255,255,255,.7)' }}>EPISODE 08</span>
      <div style={{ fontSize: titleSize, fontWeight: 700, letterSpacing: uppercase ? '.4px' : '-1.1px', lineHeight: uppercase ? 1.4 : 1.05, textTransform: uppercase ? 'uppercase' : 'none' }}>
        {subject.split(' ').map((word, i, words) => (<span key={i}>{word}{i < words.length - 1 && <br />}</span>))}
      </div>
    </div>
  )

  const metaChip = (
    <span style={{ background: 'var(--color-accent-tint)', color: 'var(--color-accent-text)', borderRadius: 999, padding: '4px 11px', ...CAPTION, fontWeight: 700 }}>
      Study guide
    </span>
  )

  const themeToggle = (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={isDark ? 'btn btn-ghost on-dark' : 'btn btn-ghost'}
      style={pill('ghost')}
    >
      {isDark ? '☀ Light' : '☾ Dark'}
    </button>
  )

  // §11.3: transport controls are real labeled buttons. Playback itself is
  // AUDIO-01 (deferred), so they render as honest disabled pills (§9.1
  // not-yet-wired idiom — full opacity via .btn-undone, no fake function).
  // Colors come from the class layer (ownership rule): ghost pills in light
  // mode, and in dark mode the same ghost pill reads as the palette's white
  // chip idiom; the play circle is ink-on-light / white-on-dark via the
  // primary/secondary variants. on-dark swaps the focus ring to lime (§10).
  const transport = (clusterGap) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: clusterGap, flexWrap: 'wrap' }}>
      <button type="button" disabled title="Coming in a later update" aria-label="Change playback speed" className={`btn btn-ghost btn-undone${isDark ? ' on-dark' : ''}`} style={{ ...pill('ghost'), padding: '8px 16px', fontSize: 15, minWidth: 44 }}>1.5×</button>
      <button type="button" disabled title="Coming in a later update" aria-label="Skip back 15 seconds" className={`btn btn-ghost btn-undone${isDark ? ' on-dark' : ''}`} style={{ ...pill('ghost'), padding: '8px 16px', fontSize: 15, minWidth: 44 }}>⟲15</button>
      <button type="button" disabled title="Coming in a later update" aria-label="Pause" className={`btn ${isDark ? 'btn-secondary on-dark' : 'btn-primary'} btn-undone`} style={{ width: 56, height: 56, borderRadius: '50%', padding: 0, fontSize: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>❚❚</button>
      <button type="button" disabled title="Coming in a later update" aria-label="Skip forward 30 seconds" className={`btn btn-ghost btn-undone${isDark ? ' on-dark' : ''}`} style={{ ...pill('ghost'), padding: '8px 16px', fontSize: 15, minWidth: 44 }}>30⟳</button>
      <button type="button" disabled title="Coming in a later update" aria-label="Close player" className={`btn btn-ghost btn-undone${isDark ? ' on-dark' : ''}`} style={{ ...pill('ghost'), padding: '8px 16px', fontSize: 15, minWidth: 44 }}>⇥</button>
    </div>
  )

  // D-11: both Phase 1 exits keep their encoded hrefs, now as ghost pills.
  const exitLinks = (
    <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
      <Link href={`/subjects/${encodeURIComponent(subject)}`} className={ghostBtn} style={{ ...pill('ghost'), ...(isPhone ? { flex: '1 1 calc(50% - 8px)', textAlign: 'center' } : null) }}>
        Read instead
      </Link>
      <Link href={`/quiz?subject=${encodeURIComponent(subject)}`} className={ghostBtn} style={{ ...pill('ghost'), ...(isPhone ? { flex: '1 1 calc(50% - 8px)', textAlign: 'center' } : null) }}>
        Quiz me after
      </Link>
    </div>
  )

  const waveBlock = (
    <>
      <div aria-hidden="true" style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: isPhone ? 44 : 64 }}>
        {waveBars.map((bar, i) => (
          <div key={i} style={{ flex: 1, height: `${bar.h}%`, background: bar.c, borderRadius: 2 }}></div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', ...CAPTION, color: palette.textSecondary }}>
        <span>08:14</span>
        <span>-15:46</span>
      </div>
    </>
  )

  const episodeTitle = (
    <h1 style={{ margin: '12px 0 0', fontSize: tokens.type.display.size, lineHeight: tokens.type.display.lh, fontWeight: 700, letterSpacing: '-1px', color: palette.textPrimary }}>
      Memory, tools and the week-two failure
    </h1>
  )
  const episodeBlurb = (
    <p style={{ margin: 'var(--space-sm) 0 0', fontSize: tokens.type.body.size, lineHeight: tokens.type.body.lh, color: palette.textSecondary, maxWidth: 620 }}>
      Read aloud from your AI Agents study guide. Sections follow the guide&apos;s own headings, so you can jump to the part you skipped.
    </p>
  )

  // Desktop player card — Phase 1 proportions verbatim (212px art beside the
  // info column, transport and exits on one space-between row).
  const playerDesktop = (
    <div style={{ ...cardBase, padding: 'var(--space-lg)', display: 'flex', gap: 'var(--space-lg)', minWidth: 0 }}>
      {artTile(212, 30, false)}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
            {metaChip}
            <span style={{ ...CAPTION, color: palette.textSecondary }}>Built 14 Aug from 24 sources</span>
            <button
              type="button"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={isDark ? 'btn btn-ghost on-dark' : 'btn btn-ghost'}
              style={{ ...pill('ghost'), marginLeft: 'auto' }}
            >
              {isDark ? '☀ Light' : '☾ Dark'}
            </button>
          </div>
          {episodeTitle}
          {episodeBlurb}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
          {waveBlock}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
            {transport(22)}
            {exitLinks}
          </div>
        </div>
      </div>
    </div>
  )

  // Compact player (tablet + phone): 140px art tile, info beside, everything
  // else stacked below, transport row wrapping.
  const playerCompact = (
    <div style={{ ...cardBase, padding: isPhone ? 'var(--space-md)' : 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', minWidth: 0 }}>
      <div style={{ display: 'flex', gap: 'var(--space-sm2)', alignItems: 'flex-start' }}>
        {artTile(140, tokens.type.caption.size, true)}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--space-sm)' }}>
          {metaChip}
          <span style={{ ...CAPTION, color: palette.textSecondary }}>Built 14 Aug from 24 sources</span>
          {themeToggle}
        </div>
      </div>
      {episodeTitle}
      {episodeBlurb}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {waveBlock}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {transport('var(--space-sm)')}
          {exitLinks}
        </div>
      </div>
    </div>
  )

  // Phone: "Up next" leaves the sidebar and becomes a chip row under the
  // player (title + time on the row surface; deliberately NOT links — they
  // match the Phase 1 non-link inventory; navigation is the global TabBar).
  const upNextChips = (
    <div>
      <span style={{ ...RAIL_HEAD, display: 'block', marginBottom: 'var(--space-sm)', color: palette.textFaint }}>Up next</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
        {UP_NEXT.map((item) => (
          <div key={item.title} style={{ display: 'flex', alignItems: 'baseline', gap: 6, background: palette.rowBg, borderRadius: 999, padding: '8px 14px' }}>
            <span style={{ ...CAPTION, fontWeight: 700, color: palette.textPrimary }}>{item.title}</span>
            <span style={{ ...CAPTION, color: palette.textSecondary }}>{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  )

  // §9.7 empty idiom — untriggerable today (SECTIONS is a static constant),
  // correct the moment Phase 3 data lands.
  const listenEmpty = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 'var(--space-sm2)', padding: 'var(--space-xl2) var(--space-md)' }}>
      <div aria-hidden="true" style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: palette.rowBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>♪</div>
      <h3 style={{ margin: 0, fontSize: tokens.type.heading.size, lineHeight: tokens.type.heading.lh, fontWeight: 700, letterSpacing: '-0.3px', color: palette.textPrimary }}>Nothing to listen to yet</h3>
      <p style={{ margin: 0, fontSize: tokens.type.body.size, lineHeight: tokens.type.body.lh, color: palette.textSecondary }}>Listen mode reads your study guides aloud — build one first.</p>
      <Link href="/subjects" className={ghostBtn} style={pill('ghost')}>
        Open your subjects
      </Link>
    </div>
  )

  const sectionsCard = (
    <div style={{ ...(isDesktop ? { flex: 1.25 } : null), minWidth: 0, ...cardBase, padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-sm)', marginBottom: 'var(--space-xs)' }}>
        <h2 style={{ margin: 0, fontSize: tokens.type.heading.size, lineHeight: tokens.type.heading.lh, fontWeight: 700, letterSpacing: '-0.3px', color: palette.textPrimary }}>Sections</h2>
        <span style={{ ...CAPTION, color: palette.textSecondary }}>9 · 24 min total</span>
      </div>
      {SECTIONS.length === 0 ? (
        listenEmpty
      ) : (
        <ul role="list" style={{ ...LIST_RESET, display: 'flex', flexDirection: 'column' }}>
          {SECTIONS.map((s) => {
            // §7.1: the active row's tint is a reserved accent use.
            const accentFg = isDark ? palette.textSecondary : tokens.color.accent
            if (s.state === 'active') {
              return (
                <li key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm2)', padding: '11px 12px', borderRadius: 'var(--radius-md)', background: palette.accentTint }}>
                  <span style={{ ...CAPTION, color: accentFg, width: 22, fontWeight: 700 }}>{s.n}</span>
                  <span style={{ flex: 1, fontSize: tokens.type.body.size, lineHeight: 1.45, color: palette.textPrimary, fontWeight: 700 }}>{s.title}</span>
                  <span style={{ ...CAPTION, color: accentFg, fontWeight: 700 }}>{s.time}</span>
                  <span aria-hidden="true" style={{ color: accentFg, fontSize: 13 }}>▶</span>
                </li>
              )
            }
            if (s.state === 'done') {
              return (
                <li key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm2)', padding: '11px 12px', borderRadius: 'var(--radius-md)', background: palette.rowBg }}>
                  <span style={{ ...CAPTION, color: palette.textFaint, width: 22 }}>{s.n}</span>
                  <span style={{ flex: 1, fontSize: tokens.type.body.size, lineHeight: 1.45, color: palette.textSecondary }}>{s.title}</span>
                  <span style={{ ...CAPTION, color: palette.textFaint }}>{s.time}</span>
                  <span aria-hidden="true" style={{ color: tokens.color.success, fontSize: 13 }}>✓</span>
                </li>
              )
            }
            return (
              <li key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm2)', padding: '11px 12px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ ...CAPTION, color: palette.textFaint, width: 22 }}>{s.n}</span>
                <span style={{ flex: 1, fontSize: tokens.type.body.size, lineHeight: 1.45, color: palette.textPrimary }}>{s.title}</span>
                <span style={{ ...CAPTION, color: palette.textFaint }}>{s.time}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )

  // §9.10 lime quote card — one of lime's reserved uses; "Save to highlights"
  // is a CAPT Phase 4 action, so it renders as an honest disabled ink pill.
  const quoteCard = (
    <div style={{ width: 'auto', maxWidth: '100%', background: tokens.color.lime, borderRadius: 'var(--radius-xxl)', padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <span style={{ ...CAPTION, fontWeight: 700, letterSpacing: '.7px', color: 'rgba(18,18,26,.6)' }}>FROM THIS EPISODE</span>
        <p style={{ margin: 'var(--space-sm2) 0 0', fontSize: tokens.type.heading.size, fontWeight: 700, lineHeight: 1.35, letterSpacing: '-0.3px', color: tokens.color.ink }}>
          &ldquo;Most agents don&apos;t fail at reasoning. They fail because nobody decided what they should forget.&rdquo;
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm2)', marginTop: 'var(--space-md)' }}>
        <span style={{ ...CAPTION, color: 'rgba(18,18,26,.6)' }}>Pulled from 3 sources you saved in June and August.</span>
        <button type="button" disabled title="Coming in a later update" className="btn btn-primary btn-undone" style={{ ...pill('primary'), alignSelf: 'flex-start' }}>
          Save to highlights
        </button>
      </div>
    </div>
  )

  // Desktop right rail: quote + Up next. Once TopNav took over navigation the
  // old 250px left column held nothing but the Up-next card, so it sat as a
  // short card above ~700px of empty gutter. Up next moves into this rail and
  // the column goes away; tablet and phone both use the chip row instead.
  const bottomRow = isDesktop ? (
    <div style={{ display: 'flex', gap: 'var(--space-md2)', alignItems: 'stretch' }}>
      {sectionsCard}
      <div style={{ width: 330, flex: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-md2)' }}>
        {quoteCard}
        {upNextRail}
      </div>
    </div>
  ) : (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md2)' }}>
      {sectionsCard}
      {quoteCard}
    </div>
  )

  // Same shell shape as components/AppShell.js (skip-link → TopNav → main →
  // TabBar): Listen stays outside the (dashboard) group because it owns the
  // page background, but it should not look like a different application.
  // .theme-dark re-points the token layer for the shared chrome (globals.css
  // §6b) so the toggle darkens the nav too instead of leaving a white pill.
  return (
    <div className={isDark ? 'theme-dark' : undefined} style={{ background: palette.pageBg, minHeight: '100vh' }}>
      <a href="#listen-content" className="skip-link">Skip to content</a>
      <div
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: pagePad,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-md2)',
          boxSizing: 'border-box',
        }}
      >
        <TopNav />
        <main
          id="listen-content"
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md2)', minWidth: 0 }}
        >
          {isDesktop ? playerDesktop : playerCompact}
          {!isDesktop && upNextChips}
          {bottomRow}
        </main>
      </div>
      <TabBar />
    </div>
  )
}
