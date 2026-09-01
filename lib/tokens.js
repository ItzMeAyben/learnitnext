// Design tokens (JS half of the two-halves token system, UI-SPEC §2) — the
// mirror of the :root custom properties in app/globals.css, plus the style
// factories and SSR-safe media hooks every Phase 2 screen consumes.
//
// Deliberately directive-free so the hooks ride each consumer's own client
// boundary (the same pattern as lib/wave.js). NOTE (deferred item 2): this
// file still cannot be imported by Server Components — it depends on
// useSyncExternalStore, which the react-server build does not export, so a
// server import fails at build time. Server components (the 404, the print
// page) consume the same values through the CSS-var half — var(--color-*),
// var(--space-*), var(--radius-*) — mirrored 1:1 in app/globals.css.

import { useSyncExternalStore } from 'react'

// D-04 px boundaries: phone <768 · tablet 768–1023 · desktop ≥1024
export const bp = { phone: 768, tablet: 1024 }

export const tokens = {
  bp,
  space: { xs: 4, sm: 8, sm2: 12, md: 16, md2: 20, lg: 24, xl: 32, xl2: 40, xxl: 48, xxxl: 64 },
  radius: { sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, pill: 999, circle: '50%' },
  type: {
    sans: "'Plus Jakarta Sans',system-ui,sans-serif",
    mono: "'JetBrains Mono',ui-monospace,monospace",
    caption: { size: 12, lh: 1.4 },   // weights 500 | 700; +0.6px tracking when uppercase
    body:    { size: 14, lh: 1.55 },  // weight 500 (700 for emphasis)
    heading: { size: 20, lh: 1.3 },   // weight 700, letterSpacing -0.3
    display: { size: 32, lh: 1.15 },  // weight 700, letterSpacing -1
  },
  color: { // §7.2 names 1:1, camelCase mirror of the --color-* custom properties
    canvas: '#f3f2f9', canvasDeep: '#e9e8f1', surface: '#ffffff', surfaceTint: '#f6f5fb',
    surfaceSunken: '#f0eff6', ink: '#12121a', inkSoft: '#1c1c26', inkDeep: '#0e0e14',
    textSecondary: '#6e6c82', textTertiary: '#8b889f', textFaint: '#a09db2',
    border: '#e3e1ee', borderStrong: '#d5d2e4', divider: '#f0eff6',
    accent: '#6c3ce9', accentText: '#5b2fd0', accentTint: '#efe9ff',
    lime: '#c9f24d', amber: '#ffd84d', amberTint: '#fff2d6', amberText: '#8a5b00',
    success: '#22c55e', successTint: '#e6f7ec', successText: '#15703c',
    infoTint: '#e6f0ff', infoText: '#2a6ad6',
    dangerText: '#b03d12', dangerTint: '#ffe6dc', dangerBright: '#ff8a5c', notify: '#ff6b3d',
    onDarkSecondary: 'rgba(255,255,255,.55)', onDarkFaint: 'rgba(255,255,255,.45)',
    onColorSoft: 'rgba(255,255,255,.8)', onColorChip: 'rgba(255,255,255,.18)',
  },
  status: { // §7.3 status ladder — refined AA foregrounds (NOT the old #1a8a4a/#c2451a)
    new:    { bg: '#6c3ce9', fg: '#ffffff' },
    fetched:{ bg: '#f0eff6', fg: '#6e6c82' },
    sorted: { bg: '#efe9ff', fg: '#5b2fd0' },
    done:   { bg: '#e6f7ec', fg: '#15703c' },
    failed: { bg: '#ffe6dc', fg: '#b03d12' },
  },
  focus: { light: '#6c3ce9', dark: '#c9f24d', width: 2, offset: 2 },
  touch: 44,
}

// §7.5 Listen palette token pairs — the screen's kept light/dark toggle,
// tokenized. Values are the listen palette mapped onto §7.2 roles: wherever a
// §7.2 name exists the pair REFERENCES it (dark pageBg IS color.inkDeep, dark
// textSecondary IS color.onDarkSecondary, light pageBg IS color.canvas, …)
// instead of duplicating hex; the two values with no §7.2 role stay literal
// (dark cardBg #1a1a24 sits between inkSoft and inkDeep; the dark accent wash
// and white-alpha row/divider surfaces have no light-mode counterpart).
// Scope: consumed ONLY by app/listen/page.js — full-app dark mode stays
// deferred (§7.5). Pure data, additive: the 02-01 import contract and every
// existing export keep their shape.
tokens.listenLight = {
  pageBg: tokens.color.canvas,          // #f3f2f9
  cardBg: tokens.color.surface,         // #ffffff
  textPrimary: tokens.color.ink,        // #12121a
  textSecondary: tokens.color.textSecondary, // #6e6c82 (§7.6 AA refinement)
  textFaint: tokens.color.textFaint,    // #a09db2
  rowBg: tokens.color.surfaceTint,      // #f6f5fb
  divider: tokens.color.divider,        // #f0eff6
  chipBg: tokens.color.ink,             // #12121a
  chipText: '#ffffff',
  accentTint: tokens.color.accentTint,  // #efe9ff
}
tokens.listenDark = {
  pageBg: tokens.color.inkDeep,         // #0e0e14
  cardBg: '#1a1a24',
  textPrimary: '#ffffff',
  textSecondary: tokens.color.onDarkSecondary, // rgba(255,255,255,.55)
  textFaint: tokens.color.onDarkFaint,  // rgba(255,255,255,.45)
  rowBg: 'rgba(255,255,255,.08)',
  divider: 'rgba(255,255,255,.08)',
  chipBg: '#ffffff',
  chipText: tokens.color.ink,           // #12121a
  accentTint: 'rgba(108,60,233,.25)',
}

// LAYOUT-ONLY pill base (§9.1): background/color/hover states live in the
// .btn-* classes in app/globals.css — a property set inline can never be
// overridden by a class's :hover rule (the ownership rule, 02-RESEARCH
// Pattern 2), so this factory must NOT return any state-touched property.
export function pill(variant) {
  return {
    minHeight: 44,
    borderRadius: 999,
    fontSize: 14,
    fontWeight: 700,
    padding: variant === 'primary' ? '12px 24px' : '12px 20px',
  }
}

// Cards have no state pseudo-classes, so an inline background is safe here.
// opts: { dark?: boolean, tone?: 'tint' }
export function card(opts = {}) {
  const background = opts.dark
    ? 'var(--color-ink)'
    : opts.tone === 'tint'
      ? 'var(--color-surface-tint)'
      : 'var(--color-surface)'
  return {
    background,
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--space-lg)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-sm2)',
  }
}

// §7.3 status pill — literal hex (readable on both light and dark surfaces).
// Unknown statuses fall back to the muted "fetched" ladder rung.
export function statusPill(status) {
  const s = tokens.status[status] || tokens.status.fetched
  return {
    background: s.bg,
    color: s.fg,
    borderRadius: 999,
    padding: '4px 10px',
    fontSize: 12,
    fontWeight: 700,
  }
}

// Standard text-glyph map (UI-SPEC §1 — no icon package, D-06)
export const GLYPHS = { guide: '▤', briefing: '✎', quiz: '?', listen: '♪', home: '⌂',
                        notebook: '◍', check: '✓', arrow: '→', play: '▶', telegram: '✈',
                        browser: '◫', text: '✉', search: '⌕' }

// SSR-safe media-query hook: getServerSnapshot MUST return false so the
// server render and the hydration render agree; React re-renders with the
// real snapshot after mount (no hydration mismatch).
const mqlCache = new Map()

function getMql(query) {
  let mql = mqlCache.get(query)
  if (!mql) {
    mql = window.matchMedia(query)
    mqlCache.set(query, mql)
  }
  return mql
}

export function useMediaQuery(query) {
  const subscribe = (onChange) => {
    const mql = getMql(query)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }
  return useSyncExternalStore(
    subscribe,
    () => getMql(query).matches,
    () => false,
  )
}

// BOTH hooks are called unconditionally — conditional hook calls crash when
// the viewport crosses the 1024px boundary.
export function useViewport() {
  const isDesktop = useMediaQuery(`(min-width: ${bp.tablet}px)`)
  const isTablet = useMediaQuery(`(min-width: ${bp.phone}px)`)
  return isDesktop ? 'desktop' : isTablet ? 'tablet' : 'phone'
}
