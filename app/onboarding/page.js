'use client'

import { useState } from 'react'
import Link from 'next/link'
import { completeOnboarding } from '../actions.js'
import { tokens, pill, card, statusPill, GLYPHS, useViewport } from '../../lib/tokens.js'

const STEPS = [
  { n: 1, label: 'Your library table' },
  { n: 2, label: 'Your agent' },
  { n: 3, label: 'Ways to save things' },
  { n: 4, label: 'The notebook bridge' },
  { n: 5, label: 'Turn on the 6am run' },
]

const STEP_META = [
  null,
  {
    title: 'Create your library table',
    body: 'One table holds everything you save — video, links, posts. It is the single source the agent reads from every night.',
    cta: 'Continue to your agent',
  },
  {
    title: 'Deploy your agent',
    body: 'The agent does the overnight work — fetch, sort, build. It is the only paid piece.',
    cta: 'Continue to ways to save',
  },
  {
    title: 'Open your ways to save things',
    body: 'One table, four doors into it. Do the playlist and Telegram now; the browser and phone doors can wait.',
    cta: 'Continue to the bridge',
  },
  {
    title: 'Connect the notebook bridge',
    body: 'Each subject becomes a notebook — study guide, briefing doc, quiz, and an audio script to listen to.',
    cta: 'Continue to the schedule',
  },
  {
    title: 'Turn on the 6am run',
    body: 'One scheduled run a day. Everything you set up above happens while you sleep.',
    cta: 'Finish setup',
  },
]

const ONBOARDED_FLAG = 'learnit_onboarded'

// Finish/Skip (02-02): keep the localStorage flag one phase for compat, then
// let the Server Action set the learnit_onboarded cookie and redirect — the
// action's roundtrip re-renders `/` server-side with the new cookie, so `/`
// lands on Today. The Links keep href="/" as the no-JS fallback.
async function finish() {
  try {
    localStorage.setItem(ONBOARDED_FLAG, '1')
  } catch {
    // storage unavailable — the Server Action still sets the cookie
  }
  await completeOnboarding()
}

// ---------- shared style idioms (UI-SPEC §6/§7.2 — token-driven, D-06) ----------

const EYEBROW = {
  fontSize: tokens.type.caption.size,
  lineHeight: tokens.type.caption.lh,
  fontWeight: 700,
  letterSpacing: '.6px',
  textTransform: 'uppercase',
  color: 'var(--color-text-secondary)',
}

const BODY = {
  margin: 0,
  fontSize: tokens.type.body.size,
  lineHeight: tokens.type.body.lh,
  color: 'var(--color-text-secondary)',
}

const CAPTION = { fontSize: tokens.type.caption.size, lineHeight: tokens.type.caption.lh }

const DOOR_CARD = {
  background: 'var(--color-surface)',
  border: '1.5px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-md)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-sm2)',
  minWidth: 0,
}

const DOOR_HEAD = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--space-sm)',
}

const DOOR_TITLE = { fontSize: tokens.type.body.size, fontWeight: 700, color: 'var(--color-ink)' }

// 36px icon tile (§9.7 idiom) — tint pairs per §7.2.
const ICON_TILE = (bg, fg) => ({
  width: 36,
  height: 36,
  flex: 'none',
  borderRadius: 'var(--radius-md)',
  background: bg,
  color: fg,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 14,
})

// §11.4 form table stakes: the BotFather token field is a real labeled input,
// monospace, scrolls internally (§10 zoom exception for mono token fields).
const TOKEN_FIELD = {
  width: '100%',
  minHeight: tokens.touch,
  fontFamily: 'var(--font-mono)',
  fontSize: tokens.type.caption.size,
  color: 'var(--color-ink)',
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-sm2)',
  overflowX: 'auto',
}

// ---------- stepper (D-10: the sidebar stepper restyled, not replaced) ----------

// §14.4 progress states: done = success-green ✓, current = accent,
// upcoming = 1.5px outline with a faint number. `onAccent` shades the
// current circle rgba-white so it reads on the accent sidebar row.
function StepCircle({ n, state, onAccent, size, glyphSize }) {
  const base = {
    width: size,
    height: size,
    flex: 'none',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: glyphSize,
    fontWeight: 700,
  }
  if (state === 'done') {
    return <div style={{ ...base, background: 'var(--color-success)', color: '#fff' }}>✓</div>
  }
  if (state === 'current') {
    return (
      <div style={{ ...base, background: onAccent ? 'rgba(255,255,255,.25)' : 'var(--color-accent)', color: '#fff' }}>
        {n}
      </div>
    )
  }
  return (
    <div style={{ ...base, border: '1.5px solid var(--color-border-strong)', color: 'var(--color-text-faint)' }}>
      {n}
    </div>
  )
}

function stepState(step, n) {
  return step > n ? 'done' : step === n ? 'current' : 'upcoming'
}

// Desktop (≥1024) — the 300px sidebar column of step rows (§9.4/§14.4).
function SidebarStepper({ step }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
      {STEPS.map((s) => {
        const state = stepState(step, s.n)
        if (state === 'current') {
          return (
            <div
              key={s.n}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm2)',
                padding: 'var(--space-sm2) var(--space-md)',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--color-accent)',
              }}
            >
              <StepCircle n={s.n} state="current" onAccent size={24} glyphSize={12} />
              <span style={{ fontSize: tokens.type.body.size, fontWeight: 700, color: '#fff' }}>{s.label}</span>
            </div>
          )
        }
        if (state === 'done') {
          return (
            <div
              key={s.n}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm2)',
                padding: 'var(--space-sm2) var(--space-md)',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--color-surface)',
              }}
            >
              <StepCircle n={s.n} state="done" size={24} glyphSize={12} />
              <span style={{ fontSize: tokens.type.body.size, fontWeight: 700, color: 'var(--color-ink)' }}>
                {s.label}
              </span>
            </div>
          )
        }
        return (
          <div
            key={s.n}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm2)',
              padding: 'var(--space-sm2) var(--space-md)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <StepCircle n={s.n} state="upcoming" size={24} glyphSize={12} />
            <span style={{ fontSize: tokens.type.body.size, color: 'var(--color-text-secondary)' }}>{s.label}</span>
          </div>
        )
      })}
    </div>
  )
}

// Tablet (768–1023) — the sidebar collapses to a horizontal dot+label
// progress bar above the panel; Cost card hidden (§12 row 2).
function TabletBar({ step }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--space-sm2)' }}>
      {STEPS.map((s) => {
        const state = stepState(step, s.n)
        return (
          <div
            key={s.n}
            style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-xs)' }}
          >
            <StepCircle n={s.n} state={state} size={24} glyphSize={12} />
            <span
              style={{
                ...CAPTION,
                textAlign: 'center',
                color: state === 'current' ? 'var(--color-ink)' : 'var(--color-text-secondary)',
                fontWeight: state === 'current' ? 700 : 500,
              }}
            >
              {s.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// Phone (<768) — dots only + a "Step X of 5" caption (§12 row 2). The footer
// meta drops its duplicate "Step N of 5" line on phone (doors copy stays).
function PhoneProgress({ step }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
        {STEPS.map((s) => (
          <StepCircle key={s.n} n={s.n} state={stepState(step, s.n)} size={16} glyphSize={9} />
        ))}
      </div>
      <div style={{ ...CAPTION, color: 'var(--color-text-secondary)', marginTop: 'var(--space-xs)' }}>
        Step {step} of 5
      </div>
    </div>
  )
}

function LogoRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-ink)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        L
      </div>
      <span style={{ fontSize: tokens.type.heading.size, fontWeight: 700, letterSpacing: '-.3px', color: 'var(--color-ink)' }}>
        LearnIt
      </span>
    </div>
  )
}

function CostCard() {
  return (
    <div
      style={{
        background: 'var(--color-lime)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-md2)',
        marginTop: 'auto',
      }}
    >
      <div style={{ ...CAPTION, fontWeight: 700, color: 'var(--color-ink)' }}>Cost so far</div>
      <div
        style={{
          fontSize: tokens.type.display.size,
          lineHeight: 1,
          fontWeight: 700,
          letterSpacing: '-1px',
          color: 'var(--color-ink)',
          marginTop: 'var(--space-xs)',
        }}
      >
        $17<span style={{ ...CAPTION, fontWeight: 700 }}>/mo</span>
      </div>
      <div style={{ ...CAPTION, color: 'var(--color-ink)', marginTop: 'var(--space-xs)' }}>
        The agent is the only paid piece. Everything else is on a free tier.
      </div>
    </div>
  )
}

function InfoCard({ title, rows }) {
  return (
    <div
      style={{
        border: '1.5px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-sm2)',
      }}
    >
      <div style={{ fontSize: tokens.type.body.size, fontWeight: 700, color: 'var(--color-ink)' }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {rows.map((row) => (
          <div key={row} style={{ fontSize: tokens.type.body.size, color: 'var(--color-text-secondary)', lineHeight: tokens.type.body.lh }}>
            {row}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [telegramConnected, setTelegramConnected] = useState(false)
  const viewport = useViewport()
  const isPhone = viewport === 'phone'
  const isDesktop = viewport === 'desktop'

  const doorsMeta =
    step === 3
      ? telegramConnected
        ? '3 of 4 doors open · nice pace'
        : "2 of 4 doors open · that's enough to start"
      : `Step ${step} of 5`

  // Phone carries "Step X of 5" on the progress dots — keep only the doors
  // line in the footer meta there (no duplicate caption).
  const showFooterMeta = !(isPhone && step !== 3)

  const panel = (
    <div
      style={{
        ...card(),
        flex: 1,
        minWidth: 0,
        borderRadius: 'var(--radius-xxl)',
        padding: isPhone ? 'var(--space-md)' : 'var(--space-lg) var(--space-xl)',
        gap: 'var(--space-lg)',
      }}
    >
      <div>
        <span style={EYEBROW}>STEP {step} OF 5</span>
        <h1
          style={{
            margin: 'var(--space-sm) 0 0',
            fontSize: tokens.type.display.size,
            lineHeight: tokens.type.display.lh,
            fontWeight: 700,
            letterSpacing: '-1px',
            color: 'var(--color-ink)',
          }}
        >
          {STEP_META[step].title}
        </h1>
        <p style={{ ...BODY, margin: 'var(--space-sm) 0 0', maxWidth: 560 }}>{STEP_META[step].body}</p>
      </div>

      {step === 3 ? (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(272px, 1fr))',
              gap: 'var(--space-sm2)',
            }}
          >
            <div style={DOOR_CARD}>
              <div style={DOOR_HEAD}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <div style={ICON_TILE('var(--color-accent-tint)', 'var(--color-accent-text)')}>{GLYPHS.play}</div>
                  <span style={DOOR_TITLE}>Learn playlist</span>
                </div>
                <span style={statusPill('done')}>Connected</span>
              </div>
              <div
                style={{
                  background: 'var(--color-surface-tint)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-sm2)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: tokens.type.caption.size,
                  color: 'var(--color-text-secondary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                PLkH8kR2FhTf9c1a2Bd7Q
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                <span style={statusPill('done')}>Unlisted ✓</span>
                <span style={statusPill('done')}>Date added, newest ✓</span>
              </div>
            </div>

            <div style={{ ...DOOR_CARD, border: '1.5px solid var(--color-accent)' }}>
              <div style={DOOR_HEAD}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <div style={ICON_TILE('var(--color-info-tint)', 'var(--color-info-text)')}>{GLYPHS.telegram}</div>
                  <span style={DOOR_TITLE}>Telegram bot</span>
                </div>
                {telegramConnected ? (
                  <span style={statusPill('done')}>Connected</span>
                ) : (
                  <span style={statusPill('sorted')}>Waiting</span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                <label htmlFor="bot-token" style={{ ...CAPTION, fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                  BotFather token
                </label>
                <input id="bot-token" type="text" placeholder="paste your BotFather token" style={TOKEN_FIELD} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-sm)' }}>
                <span style={{ ...CAPTION, color: 'var(--color-text-secondary)' }}>Send your bot a message first</span>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={pill('primary')}
                  onClick={() => setTelegramConnected(true)}
                >
                  Verify
                </button>
              </div>
            </div>

            <div style={DOOR_CARD}>
              <div style={DOOR_HEAD}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <div style={ICON_TILE('var(--color-surface-sunken)', 'var(--color-text-secondary)')}>{GLYPHS.browser}</div>
                  <span style={DOOR_TITLE}>Browser save</span>
                </div>
                <span style={statusPill('fetched')}>Optional</span>
              </div>
              <p style={{ ...BODY, ...CAPTION, lineHeight: 1.5 }}>
                Right-click any page to file it. Needs a free relay in between, because extensions strip the auth header.
              </p>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ ...pill('ghost'), alignSelf: 'flex-start' }}
                onClick={() => setStep((s) => Math.min(5, s + 1))}
              >
                Set up later
              </button>
            </div>

            <div style={DOOR_CARD}>
              <div style={DOOR_HEAD}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <div style={ICON_TILE('var(--color-surface-sunken)', 'var(--color-text-secondary)')}>{GLYPHS.text}</div>
                  <span style={DOOR_TITLE}>Text a number</span>
                </div>
                <span style={statusPill('fetched')}>Optional</span>
              </div>
              <p style={{ ...BODY, ...CAPTION, lineHeight: 1.5 }}>
                A US number needs carrier registration first, 10 to 15 days. UK numbers work the same day.
              </p>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ ...pill('ghost'), alignSelf: 'flex-start' }}
                onClick={() => setStep((s) => Math.min(5, s + 1))}
              >
                Set up later
              </button>
            </div>
          </div>

          <div
            style={{
              background: 'var(--color-amber-tint)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-md) var(--space-md2)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-md)',
            }}
          >
            <div style={ICON_TILE('var(--color-surface)', 'var(--color-amber-text)')}>!</div>
            <p style={BODY}>
              The playlist feed only ever returns the first 15 items, so leave the ordering on{' '}
              <span style={{ color: 'var(--color-ink)', fontWeight: 700 }}>Date added (newest)</span> or your newest saves
              quietly fall off the end.
            </p>
          </div>
        </>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-sm2)' }}>
          {step === 1 && (
            <InfoCard
              title="Your table"
              rows={[
                'new — saved, waiting for the nightly run',
                'fetched — transcript or text pulled',
                'sorted — filed under a subject',
                'done — built into your notebook',
              ]}
            />
          )}
          {step === 2 && (
            <InfoCard
              title="Your agent"
              rows={[
                'Runs at 6:00am while you sleep',
                'Reads every new row, writes results back',
                '$17/mo — the only paid piece',
              ]}
            />
          )}
          {step === 4 && (
            <InfoCard
              title="What gets built"
              rows={[
                'Study guide — ordered like a course',
                'Briefing doc — the short version',
                'Quiz — from the sources you saved',
                'Audio — listen to the guide',
              ]}
            />
          )}
          {step === 5 && (
            <InfoCard
              title="The nightly run"
              rows={[
                '6:00am · capture → fetch → sort → build → digest',
                'A summary lands in Telegram',
                'You can also trigger a run from the Pipeline screen',
              ]}
            />
          )}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: isPhone ? 'column' : 'row',
          alignItems: isPhone ? 'stretch' : 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-md)',
          borderTop: '1px solid var(--color-divider)',
          paddingTop: 'var(--space-md2)',
          marginTop: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          {showFooterMeta && <span style={{ ...CAPTION, color: 'var(--color-text-secondary)' }}>{doorsMeta}</span>}
          <Link href="/" replace onClick={() => finish()} className="btn btn-link">
            Skip setup →
          </Link>
        </div>
        <div style={{ display: 'flex', flexDirection: isPhone ? 'column' : 'row', gap: 'var(--space-sm)' }}>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ ...pill('ghost'), width: isPhone ? '100%' : undefined }}
            disabled={step === 1}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
          >
            Back
          </button>
          {step < 5 ? (
            <button
              type="button"
              className="btn btn-primary"
              style={{ ...pill('primary'), width: isPhone ? '100%' : undefined }}
              onClick={() => setStep((s) => Math.min(5, s + 1))}
            >
              {STEP_META[step].cta}
            </button>
          ) : (
            <Link
              href="/"
              replace
              onClick={() => finish()}
              className="btn btn-primary"
              style={{ ...pill('primary'), width: isPhone ? '100%' : undefined }}
            >
              Finish setup
            </Link>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ background: 'var(--color-canvas-deep)', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 1280 }}>
        {isDesktop ? (
          <div
            style={{
              background: 'var(--color-canvas)',
              padding: 'var(--space-lg) var(--space-xl)',
              display: 'flex',
              gap: 'var(--space-lg)',
              alignItems: 'stretch',
              minHeight: '100vh',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ width: 300, flex: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-md2)' }}>
              <LogoRow />
              <div>
                <div
                  style={{
                    fontSize: tokens.type.display.size,
                    lineHeight: tokens.type.display.lh,
                    fontWeight: 700,
                    letterSpacing: '-1px',
                    color: 'var(--color-ink)',
                  }}
                >
                  Set it up once
                </div>
                <p style={{ ...BODY, margin: 'var(--space-sm) 0 0' }}>
                  About 90 minutes. Runs on free tiers end to end, except the agent. No code.
                </p>
              </div>
              <SidebarStepper step={step} />
              <CostCard />
            </div>
            {panel}
          </div>
        ) : (
          <div
            style={{
              background: 'var(--color-canvas)',
              padding: isPhone ? 'var(--space-md)' : 'var(--space-lg) var(--space-xl)',
              display: 'flex',
              flexDirection: 'column',
              gap: isPhone ? 'var(--space-md)' : 'var(--space-lg)',
              minHeight: '100vh',
              boxSizing: 'border-box',
            }}
          >
            <LogoRow />
            {isPhone ? <PhoneProgress step={step} /> : <TabletBar step={step} />}
            {panel}
          </div>
        )}
      </div>
    </div>
  )
}
