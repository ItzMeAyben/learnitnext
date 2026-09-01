'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { tokens, pill, card, statusPill, GLYPHS } from '../lib/tokens.js'

// D-02 landing: the product story from the spec, told with the app's own
// design system (tokens + §9 vocabulary from lib/tokens.js and the globals
// class layer) and the REAL subject tiles from the store as proof. Rendered
// by app/page.js for visitors without the learnit_onboarded cookie — no
// dashboard chrome (no TopNav, no TabBar).

const EYEBROW = {
  margin: 0,
  fontSize: tokens.type.caption.size,
  fontWeight: 700,
  letterSpacing: '0.6px',
  textTransform: 'uppercase',
  color: 'var(--color-text-tertiary)',
}

const H2 = {
  margin: 0,
  fontSize: tokens.type.heading.size,
  lineHeight: tokens.type.heading.lh,
  fontWeight: 700,
  letterSpacing: '-0.3px',
  color: 'var(--color-ink)',
}

const BODY = {
  margin: 0,
  fontSize: tokens.type.body.size,
  lineHeight: tokens.type.body.lh,
  color: 'var(--color-text-secondary)',
}

const CAPTION = {
  fontSize: tokens.type.caption.size,
  lineHeight: tokens.type.caption.lh,
  color: 'var(--color-text-secondary)',
}

const LIST_RESET = { margin: 0, padding: 0, listStyle: 'none' }

// §12 row 1 grids: 4-across → 2×2 → 1-col falls out of one auto-fit rule.
const QUAD_GRID = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
  gap: 'var(--space-md)',
}

function Wordmark() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 'var(--radius-sm)',
          background: 'var(--color-ink)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        L
      </div>
      <span style={{ fontSize: tokens.type.heading.size, fontWeight: 700, letterSpacing: '-0.3px', color: 'var(--color-ink)' }}>
        LearnIt
      </span>
    </div>
  )
}

// Proof tiles — the subjects-page idiom (featured colored tile with the amber
// progress bar, others as list tiles with a tileColor dot), reused verbatim.
function FeaturedTile({ subject }) {
  return (
    <Link
      href={`/subjects/${encodeURIComponent(subject.id)}`}
      style={{
        background: subject.color,
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-md)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-sm2)',
        textDecoration: 'none',
      }}
    >
      <span style={{ fontSize: 18, fontWeight: 700 }}>{subject.id}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ height: 6, borderRadius: 999, background: 'var(--color-on-color-chip)', overflow: 'hidden' }}>
          <div style={{ width: `${subject.readPct}%`, height: '100%', background: 'var(--color-amber)', borderRadius: 999 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-on-color-soft)' }}>
          <span>Study guide read</span>
          <span>{subject.readPct}% · {subject.sourceCount} sources</span>
        </div>
      </div>
    </Link>
  )
}

function ListTile({ subject }) {
  return (
    <Link
      href={`/subjects/${encodeURIComponent(subject.id)}`}
      style={{
        background: 'var(--color-surface-tint)',
        borderRadius: 'var(--radius-lg)',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        textDecoration: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm2)', minWidth: 0 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: subject.tileColor, flex: 'none' }} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-ink)' }}>{subject.id}</div>
          <div style={{ ...CAPTION, marginTop: 2 }}>{subject.sourceCount} sources · {subject.readPct}% read</div>
        </div>
      </div>
      <span
        style={{
          background: 'var(--color-accent-tint)',
          color: 'var(--color-accent-text)',
          borderRadius: 999,
          padding: '4px 10px',
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        {subject.readPct}%
      </span>
    </Link>
  )
}

function ProofTile({ subject, featured }) {
  return featured ? <FeaturedTile subject={subject} /> : <ListTile subject={subject} />
}

// The proof strip: stacked tiles on tablet/desktop, and on phone the ONE
// sanctioned horizontal scroll — the .scroll-snap-x carousel with ~78vw
// .snap-item children. The tablet/desktop stacks are identical, so they share
// the tiles; the visibility helpers pick the container per breakpoint.
function ProofStrip({ tiles, loading }) {
  if (loading) {
    const skeletonStack = { ...LIST_RESET, display: 'flex', flexDirection: 'column', gap: 'var(--space-sm2)' }
    return (
      <div aria-busy="true">
        <ul className="only-phone scroll-snap-x" style={LIST_RESET}>
          {[0, 1, 2].map((i) => (
            <li key={i} className="snap-item skeleton" style={{ width: '78vw', maxWidth: 360, height: 104 }} />
          ))}
        </ul>
        <ul className="only-tablet" style={skeletonStack}>
          {[0, 1, 2].map((i) => (
            <li key={i} className="skeleton" style={{ height: 84 }} />
          ))}
        </ul>
        <ul className="only-desktop" style={skeletonStack}>
          {[0, 1, 2].map((i) => (
            <li key={i} className="skeleton" style={{ height: 84 }} />
          ))}
        </ul>
      </div>
    )
  }

  const [featured, ...others] = tiles
  return (
    <div>
      <ul className="only-phone scroll-snap-x" style={LIST_RESET} aria-label="Your subjects">
        {tiles.map((subject) => (
          <li key={subject.id} className="snap-item" style={{ width: '78vw', maxWidth: 360 }}>
            <ProofTile subject={subject} featured={subject === featured} />
          </li>
        ))}
      </ul>
      {['only-tablet', 'only-desktop'].map((cls) => (
        <ul key={cls} className={cls} style={{ ...LIST_RESET, display: 'flex', flexDirection: 'column', gap: 'var(--space-sm2)' }} aria-label="Your subjects">
          {featured && (
            <li>
              <FeaturedTile subject={featured} />
            </li>
          )}
          {others.map((subject) => (
            <li key={subject.id}>
              <ListTile subject={subject} />
            </li>
          ))}
        </ul>
      ))}
    </div>
  )
}

const LOOP_STEPS = ['You save a link', 'It lands in one table', 'An agent reads it', 'Course material appears']

const DOORS = [
  {
    glyph: GLYPHS.play,
    label: 'Learn playlist',
    caption: 'Save any video to your Learn playlist',
    iconBg: 'var(--color-danger-tint)',
    iconFg: 'var(--color-danger-text)',
  },
  {
    glyph: GLYPHS.telegram,
    label: 'Telegram bot',
    caption: 'Forward links to your bot',
    iconBg: 'var(--color-info-tint)',
    iconFg: 'var(--color-info-text)',
  },
  {
    glyph: GLYPHS.browser,
    label: 'Browser right-click',
    caption: 'Right-click any page to file it',
    iconBg: 'var(--color-surface-sunken)',
    iconFg: 'var(--color-text-secondary)',
  },
  {
    glyph: GLYPHS.text,
    label: 'Text a number',
    caption: 'Send a link by SMS',
    iconBg: 'var(--color-surface-sunken)',
    iconFg: 'var(--color-text-secondary)',
  },
]

const RUN_STEPS = [
  { title: 'Fetch', body: 'Reads every new link and stores the full text.' },
  { title: 'Sort', body: 'Files each one under a subject.' },
  { title: 'Build', body: 'Turns each subject into course material.' },
]

const LADDER = ['new', 'fetched', 'sorted', 'done']

const PAYOFF = [
  { glyph: GLYPHS.guide, label: 'Study guide', meta: 'Ordered like a course', iconBg: 'var(--color-accent-tint)', iconFg: 'var(--color-accent-text)' },
  { glyph: GLYPHS.briefing, label: 'Briefing doc', meta: 'The short version', iconBg: 'var(--color-success-tint)', iconFg: 'var(--color-success-text)' },
  { glyph: GLYPHS.quiz, label: 'Quiz', meta: 'From the sources you saved', iconBg: 'var(--color-amber-tint)', iconFg: 'var(--color-amber-text)' },
  { glyph: GLYPHS.listen, label: 'Listen mode', meta: 'Read to you on the go', iconBg: 'var(--color-danger-tint)', iconFg: 'var(--color-danger-text)' },
]

export default function Landing() {
  const router = useRouter()
  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => fetch('/api/subjects').then((r) => r.json()),
  })

  // Migration shim (research Pattern 1, kept one phase): Phase 1 users carry
  // only the localStorage flag. The server rendered the landing because no
  // cookie was sent — the correct pre-shim state, so there is no flash. If
  // the legacy flag is set, write the cookie client-side and refresh; the
  // server re-renders `/` as Today. Retires in Phase 3.
  useEffect(() => {
    try {
      if (window.localStorage.getItem('learnit_onboarded') === '1') {
        document.cookie = 'learnit_onboarded=1; path=/; max-age=31536000'
        router.refresh()
      }
    } catch {
      // storage unavailable — the visitor simply stays on the landing
    }
  }, [router])

  return (
    <div style={{ background: 'var(--color-canvas)', minHeight: '100vh' }}>
      <main
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: 'clamp(16px, 4vw, 24px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-xxxl)',
        }}
      >
        {/* 1 · Hero */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
            gap: 'var(--space-xl)',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', minWidth: 0 }}>
            <Wordmark />
            <p style={{ ...EYEBROW, marginTop: 'var(--space-sm)' }}>SAVE LINKS · WAKE UP TO COURSES</p>
            <h1
              style={{
                margin: 0,
                fontSize: tokens.type.display.size,
                lineHeight: tokens.type.display.lh,
                fontWeight: 700,
                letterSpacing: '-1px',
                color: 'var(--color-ink)',
                maxWidth: 560,
              }}
            >
              Save a link today. Wake up to course material tomorrow.
            </h1>
            <p style={{ ...BODY, maxWidth: 520 }}>
              Everything you already save — YouTube videos, articles, links you text yourself — becomes study guides,
              briefing docs and quizzes, sorted by subject, generated overnight while you sleep.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-sm2)', flexWrap: 'wrap', marginTop: 'var(--space-xs)' }}>
              <Link href="/onboarding" className="btn btn-primary" style={pill('primary')}>
                Start setup
              </Link>
              {/* Plain anchor jump — CSS scroll-behavior is not set globally (reduced motion) */}
              <a href="#how-it-works" className="btn btn-ghost" style={pill()}>
                See how it works
              </a>
            </div>
          </div>
          <ProofStrip tiles={subjects ?? []} loading={!subjects} />
        </section>

        {/* 2 · The loop */}
        <section id="how-it-works" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md2)' }}>
          <h2 style={H2}>How it works</h2>
          <div style={QUAD_GRID}>
            {LOOP_STEPS.map((step, i) => (
              <div key={step} style={{ ...card(), borderRadius: 'var(--radius-md)', padding: 'var(--space-md)', gap: 'var(--space-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        border: `1.5px solid var(--color-border-strong)`,
                        color: 'var(--color-text-faint)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 700,
                        flex: 'none',
                      }}
                    >
                      {i + 1}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-ink)' }}>{step}</span>
                  </div>
                  {i < LOOP_STEPS.length - 1 && (
                    <span className="only-desktop" aria-hidden="true" style={{ fontSize: 16, color: 'var(--color-text-faint)' }}>
                      →
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p style={BODY}>…and you get told</p>
        </section>

        {/* 3 · Four doors */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md2)' }}>
          <h2 style={H2}>Four ways to save things</h2>
          <div style={QUAD_GRID}>
            {DOORS.map((door) => (
              <div key={door.label} style={{ ...card(), gap: 'var(--space-sm2)' }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 'var(--radius-md)',
                    background: door.iconBg,
                    color: door.iconFg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                  }}
                >
                  {door.glyph}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-ink)' }}>{door.label}</div>
                <p style={BODY}>{door.caption}</p>
              </div>
            ))}
          </div>
          <p style={BODY}>Do the playlist and Telegram now; the rest can wait.</p>
          <div style={{ display: 'flex', gap: 'var(--space-sm2)', flexWrap: 'wrap' }}>
            <Link href="/onboarding" className="btn btn-ghost" style={pill()}>
              Start setup
            </Link>
          </div>
        </section>

        {/* 4 · Overnight pipeline */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md2)' }}>
          <h2 style={H2}>While you sleep, it runs</h2>
          <div style={QUAD_GRID}>
            {RUN_STEPS.map((step) => (
              <div key={step.title} style={{ ...card(), borderRadius: 'var(--radius-md)', padding: 'var(--space-md)' }}>
                <span style={{ ...CAPTION, fontWeight: 700, color: 'var(--color-text-tertiary)' }}>at 6:00am</span>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-ink)', marginTop: 'var(--space-xs)' }}>{step.title}</div>
                <p style={{ ...BODY, marginTop: 'var(--space-xs)' }}>{step.body}</p>
              </div>
            ))}
          </div>
          <div style={card()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
              {LADDER.map((status, i) => (
                <span key={status} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <span style={statusPill(status)}>{status}</span>
                  {i < LADDER.length - 1 && (
                    <span aria-hidden="true" style={{ color: 'var(--color-text-faint)', fontSize: 13 }}>
                      →
                    </span>
                  )}
                </span>
              ))}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--space-md)',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ fontFamily: tokens.type.mono, fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                06:00:02 → 06:04:01
              </span>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Link href="/pipeline" className="btn btn-link">
                  See the full run →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 5 · What you get */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md2)' }}>
          <h2 style={H2}>Your subjects become courses</h2>
          <div style={QUAD_GRID}>
            {PAYOFF.map((item) => (
              <div key={item.label} style={{ ...card(), gap: 'var(--space-sm2)' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-md)',
                    background: item.iconBg,
                    color: item.iconFg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 15,
                  }}
                >
                  {item.glyph}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-ink)' }}>{item.label}</div>
                <p style={CAPTION}>{item.meta}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6 · Final CTA */}
        <section
          style={{
            background: 'var(--color-lime)',
            borderRadius: 'var(--radius-xxl)',
            padding: 'var(--space-xl)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-md)',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: tokens.type.heading.size,
              lineHeight: tokens.type.heading.lh,
              fontWeight: 700,
              letterSpacing: '-0.3px',
              color: 'var(--color-ink)',
              maxWidth: 560,
            }}
          >
            Set it up once. About 90 minutes. Free tiers end to end, except the agent.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-sm2)', flexWrap: 'wrap' }}>
            <Link href="/onboarding" className="btn btn-primary" style={pill('primary')}>
              Start setup
            </Link>
          </div>
        </section>

        {/* 7 · Footer */}
        <footer
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-md)',
            flexWrap: 'wrap',
            borderTop: '1px solid var(--color-divider)',
            paddingTop: 'var(--space-md)',
          }}
        >
          <Wordmark />
          <span style={CAPTION}>Built from your own saved links.</span>
          <span style={{ fontFamily: tokens.type.mono, fontSize: 12, color: 'var(--color-text-tertiary)' }}>LearnIt</span>
        </footer>
      </main>
    </div>
  )
}
