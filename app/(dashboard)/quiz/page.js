'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { QUIZ_ITEMS } from '../../../lib/store.js'
import { tokens, pill, card, GLYPHS } from '../../../lib/tokens.js'

// Quiz (UI-SPEC §12 row 7): 880px card with clamp() padding (md on phone),
// header that wraps crumb-over-progress on narrow widths, options as real
// ≥56px <button>s, footer that stacks hint-over-full-width-Skip/Next, and
// score cards on an auto-fit grid (2-across desktop → 1-col phone).
//
// Phase 1 wires are byte-identical (D-11 / FLOW-04): the Suspense-wrapped
// useSearchParams subject context, the backHref/playHref ternaries with
// encodeURIComponent, and the next-question advance logic. QUIZ_ITEMS stays
// the static store data — DATA-02 (Phase 3) swaps in the real quiz fetch,
// which is also when the §14.3 error state ("Couldn't load the quiz — check
// the pipeline." + Retry) lands. No fetch today → no dead error branch.

const TOTAL_QUESTIONS = 12
const QUESTION_INDEX = 4

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

// §12 row 7 rung 1: card padding md (16) at phone → xl2 (40) at desktop.
const CARD_PADDING = 'clamp(16px, 5vw, 40px)'

export default function QuizPage() {
  return (
    <Suspense fallback={<QuizSkeleton />}>
      <QuizScreen />
    </Suspense>
  )
}

// §14.3 loading state: card-shaped skeleton + 4 option-height rows, sr-only
// "Dealing the questions…". This fallback genuinely renders while
// useSearchParams suspends the client tree.
function QuizSkeleton() {
  return (
    <div
      aria-busy="true"
      style={{
        width: 880,
        maxWidth: '100%',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        padding: CARD_PADDING,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-md2)',
      }}
    >
      <span style={SR_ONLY}>Dealing the questions…</span>
      <div className="skeleton" style={{ height: 22, width: 260, borderRadius: 'var(--radius-pill)' }} />
      <div className="skeleton" style={{ height: 54, width: '84%' }} />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="skeleton" style={{ height: 64, borderRadius: 'var(--radius-lg)' }} />
      ))}
    </div>
  )
}

// §14.3 empty state (§9.7 idiom). Untriggerable with today's static
// QUIZ_ITEMS — it exists so Phase 3's real quiz data gets the right copy
// for free.
function EmptyNoQuiz() {
  return (
    <div style={{ ...card(), alignItems: 'center', textAlign: 'center', padding: 'var(--space-xl2)' }}>
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
          color: 'var(--color-text-secondary)',
        }}
      >
        {GLYPHS.quiz}
      </div>
      <div
        style={{
          fontSize: tokens.type.heading.size,
          lineHeight: tokens.type.heading.lh,
          fontWeight: 700,
          letterSpacing: '-0.3px',
          color: 'var(--color-ink)',
        }}
      >
        No quiz yet
      </div>
      <p style={{ ...BODY, maxWidth: 340 }}>Quizzes are built with your study guide — save a few more links first.</p>
    </div>
  )
}

function QuizScreen() {
  const searchParams = useSearchParams()
  const subject = searchParams.get('subject')
  const [picked, setPicked] = useState(null)
  const [qIndex, setQIndex] = useState(QUESTION_INDEX)
  const graded = picked !== null

  const backHref = subject ? `/subjects/${encodeURIComponent(subject)}` : '/subjects'
  const playHref = subject ? `/listen?subject=${encodeURIComponent(subject)}` : '/listen?subject=AI%20Agents'

  const hint =
    picked === null
      ? 'Pick one — no timer, and a wrong answer just goes back in the deck.'
      : picked === 1
      ? 'Correct. Two of your sources make this point about what to forget.'
      : 'Not quite — memory is the first suspect. Section 03 of the study guide covers it.'

  const hasQuiz = QUIZ_ITEMS.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md2)' }}>
      {/* §12 row 7 header: crumb + progress + Exit on ONE row where width
          allows; flexWrap drops the progress row under the crumb on phone
          (rung 1, no JS). Exit stays the same D-11 backHref ternary. */}
      <div
        style={{
          width: 880,
          maxWidth: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-sm)',
        }}
      >
        <nav
          aria-label="Breadcrumb"
          style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-xs)', fontSize: tokens.type.caption.size }}
        >
          <Link href={backHref} className="crumb-link" style={CRUMB}>
            {subject ?? 'AI Agents'}
          </Link>
          <span aria-hidden="true" style={{ ...CAPTION, color: 'var(--color-text-faint)' }}>
            /
          </span>
          <span style={{ ...CRUMB, color: 'var(--color-ink)', fontWeight: 700 }}>
            Quiz · {TOTAL_QUESTIONS} questions
          </span>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm2)', flex: '1 1 260px', minWidth: 0, justifyContent: 'flex-end' }}>
          <div
            style={{
              flex: 1,
              minWidth: 0,
              height: 6,
              borderRadius: 'var(--radius-pill)',
              background: 'var(--color-surface-sunken)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${Math.round((qIndex / TOTAL_QUESTIONS) * 100)}%`,
                height: '100%',
                background: 'var(--color-accent)',
                borderRadius: 'var(--radius-pill)',
              }}
            />
          </div>
          <span style={{ ...CAPTION, whiteSpace: 'nowrap' }}>
            Question {qIndex} of {TOTAL_QUESTIONS}
          </span>
          <Link href={backHref} className="btn btn-secondary" style={pill('secondary')}>
            Exit
          </Link>
        </div>
      </div>

      <div
        style={{
          width: 880,
          maxWidth: '100%',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          padding: CARD_PADDING,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-md2)',
        }}
      >
        {QUIZ_ITEMS.length === 0 && <EmptyNoQuiz />}
        {hasQuiz && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
              <span
                style={{
                  background: 'var(--color-amber-tint)',
                  color: 'var(--color-amber-text)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '4px 10px',
                  fontSize: tokens.type.caption.size,
                  fontWeight: 700,
                  letterSpacing: '0.6px',
                }}
              >
                MULTIPLE CHOICE
              </span>
              <span style={CAPTION}>From "How agent memory actually works" · Latent Space</span>
            </div>

            {/* §6 exception: the quiz question is Heading 20/700/lh 1.35 —
                the screen's single h1, deliberately down from Display 32. */}
            <h1
              style={{
                margin: 0,
                fontSize: tokens.type.heading.size,
                fontWeight: 700,
                letterSpacing: '-0.3px',
                lineHeight: 1.35,
                color: 'var(--color-ink)',
              }}
            >
              An agent keeps looping on the same tool call. According to your sources, what is the first thing to check?
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {QUIZ_ITEMS.map((item, i) => {
                const isPicked = picked === i
                // Graded tints are state-by-props (not pseudo-classes), so
                // inline is legal here; tokens source every §7.2 name that
                // exists, the two graded border greens/reds stay literal.
                let bg = 'var(--color-surface)'
                let bd = 'var(--color-border)'
                let badgeBg = 'var(--color-canvas)'
                let badgeFg = 'var(--color-text-secondary)'
                let mark = ''
                let markFg = 'var(--color-ink)'
                if (graded && item.correct) {
                  bg = 'var(--color-success-tint)'
                  bd = '#7ed49f'
                  badgeBg = 'var(--color-success)'
                  badgeFg = '#ffffff'
                  mark = '✓'
                  markFg = 'var(--color-success-text)'
                }
                if (graded && isPicked && !item.correct) {
                  bg = 'var(--color-danger-tint)'
                  bd = '#f0a488'
                  badgeBg = 'var(--color-notify)'
                  badgeFg = '#ffffff'
                  mark = '✕'
                  markFg = 'var(--color-danger-text)'
                }
                return (
                  <button
                    type="button"
                    key={item.letter}
                    onClick={() => setPicked(i)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-md)',
                      textAlign: 'left',
                      minHeight: 56,
                      width: '100%',
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-lg)',
                      cursor: 'pointer',
                      font: 'inherit',
                      background: bg,
                      border: `1.5px solid ${bd}`,
                    }}
                  >
                    <span
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 'var(--radius-md)',
                        flex: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: tokens.type.body.size,
                        fontWeight: 700,
                        background: badgeBg,
                        color: badgeFg,
                      }}
                    >
                      {item.letter}
                    </span>
                    <span
                      style={{
                        flex: 1,
                        fontSize: tokens.type.body.size,
                        lineHeight: tokens.type.body.lh,
                        color: 'var(--color-ink)',
                        fontWeight: 500,
                      }}
                    >
                      {item.label}
                    </span>
                    <span style={{ fontSize: tokens.type.body.size, color: markFg }}>{mark}</span>
                  </button>
                )
              })}
            </div>

            {/* §12 row 7 footer: hint caption above, then a button row that
                sits side-by-side desktop and stacks full-width on phone
                (flexWrap + flex-basis 200px, rung 1). */}
            <div
              style={{
                borderTop: '1px solid var(--color-divider)',
                paddingTop: 'var(--space-md2)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-sm)',
              }}
            >
              <span style={CAPTION}>{hint}</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ ...pill('ghost'), flex: '1 1 200px' }}
                  onClick={() => setPicked(null)}
                >
                  Skip
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ ...pill('primary'), flex: '1 1 200px' }}
                  onClick={() => {
                    setQIndex((q) => (q < TOTAL_QUESTIONS ? q + 1 : q))
                    setPicked(null)
                  }}
                >
                  Next question
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Score cards: 2-across desktop → stacked phone (auto-fit, rung 2). */}
      {hasQuiz && (
        <div
          style={{
            width: 880,
            maxWidth: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
            gap: 'var(--space-md)',
          }}
        >
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-md2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 'var(--space-sm)',
            }}
          >
            <div>
              <div style={{ fontSize: tokens.type.body.size, fontWeight: 700, color: 'var(--color-ink)' }}>Score so far</div>
              <div style={{ ...CAPTION, marginTop: 4 }}>Best on this quiz: 8/12</div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
              <div
                aria-hidden="true"
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-success-tint)',
                  color: 'var(--color-success-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: tokens.type.caption.size,
                }}
              >
                ✓
              </div>
              <div
                aria-hidden="true"
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-success-tint)',
                  color: 'var(--color-success-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: tokens.type.caption.size,
                }}
              >
                ✓
              </div>
              <div
                aria-hidden="true"
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-danger-tint)',
                  color: 'var(--color-danger-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: tokens.type.caption.size,
                }}
              >
                ✕
              </div>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-accent-tint)',
                  color: 'var(--color-accent-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: tokens.type.caption.size,
                  fontWeight: 700,
                }}
              >
                4
              </div>
            </div>
          </div>
          <div
            style={{
              background: 'var(--color-lime)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-md2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 'var(--space-sm)',
            }}
          >
            <div>
              <div style={{ fontSize: tokens.type.body.size, fontWeight: 700, color: 'var(--color-ink)' }}>Prefer to listen?</div>
              <div style={{ ...CAPTION, marginTop: 4, color: 'var(--color-ink)' }}>This quiz's source section is 4:20</div>
            </div>
            {/* Play keeps the D-11 playHref ternary — subject context rides
                to Listen. Primary stays ink on the lime card (§9.1). */}
            <Link href={playHref} className="btn btn-primary" style={pill('primary')}>
              ♪ Play
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
