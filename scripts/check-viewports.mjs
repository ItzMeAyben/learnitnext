#!/usr/bin/env node
// check-viewports.mjs — shared headless viewport-verification tool (Phase 2).
// Sweeps routes × widths on the local dev server, injects the onboarded
// cookie, asserts no horizontal overflow, and captures screenshots.
//
// Throwaway verification-only tooling: NOT imported by app code; playwright-core
// is installed ad hoc (`npm i --no-save playwright-core`) and drives the system
// Chrome via channel:'chrome' — no browser download, nothing added to package.json.
//
// Usage:
//   node scripts/check-viewports.mjs [--port 3199] [--routes /,/library,...]
//                                    [--out /tmp/shots] [--no-cookie] [--help]
//
// Exit codes: 0 = ALL VIEWPORTS CLEAN · 1 = <n> failures (overflow found) ·
//             2 = playwright-core not installed

import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

// Full route list (02-12): every screen in the app, including the query-string
// routes and the print sheet — the phase-final sweep default. Keep complete for
// future phases.
const DEFAULT_ROUTES = [
  '/',
  '/onboarding',
  '/subjects',
  '/subjects/AI%20Agents',
  '/pathway/AI%20Agents',
  '/pathway/AI%20Agents/print',
  '/quiz?subject=AI%20Agents',
  '/listen?subject=AI%20Agents',
  '/library',
  '/pipeline',
  '/session',
  '/nope',
]
const WIDTHS = [360, 390, 768, 1024, 1440]

function usage() {
  console.log(`Usage: node scripts/check-viewports.mjs [options]

Options:
  --port <n>        Dev-server port (default 3199)
  --routes <list>   Comma-separated routes (default: all app routes)
  --out <dir>       Screenshot directory (default /tmp/shots)
  --no-cookie       Skip learnit_onboarded cookie injection (un-onboarded visitor)
  -h, --help        Show this help

Widths swept: ${WIDTHS.join(', ')}
Exit codes: 0 clean · 1 overflow failures · 2 playwright-core missing`)
}

function parseArgs(argv) {
  const opts = { port: 3199, routes: DEFAULT_ROUTES.join(','), out: '/tmp/shots', cookie: true }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '-h' || a === '--help') opts.help = true
    else if (a === '--port') opts.port = Number(argv[++i])
    else if (a.startsWith('--port=')) opts.port = Number(a.slice('--port='.length))
    else if (a === '--routes') opts.routes = argv[++i] ?? opts.routes
    else if (a.startsWith('--routes=')) opts.routes = a.slice('--routes='.length)
    else if (a === '--out') opts.out = argv[++i] ?? opts.out
    else if (a.startsWith('--out=')) opts.out = a.slice('--out='.length)
    else if (a === '--no-cookie') opts.cookie = false
    else console.warn(`Ignoring unknown argument: ${a}`)
  }
  if (!Number.isFinite(opts.port) || opts.port <= 0) {
    console.error(`Invalid --port value; using default 3199`)
    opts.port = 3199
  }
  return opts
}

const opts = parseArgs(process.argv.slice(2))
if (opts.help) {
  usage()
  process.exit(0)
}

let chromium
try {
  ;({ chromium } = await import('playwright-core'))
} catch {
  console.error('playwright-core is not installed.')
  console.error('Run: npm install --no-save playwright-core')
  process.exit(2)
}

const ROUTES = opts.routes.split(',').map((r) => r.trim()).filter(Boolean)
mkdirSync(opts.out, { recursive: true })

const base = `http://localhost:${opts.port}`
const browser = await chromium.launch({ channel: 'chrome', headless: true })
let failures = 0
try {
  for (const route of ROUTES) {
    for (const width of WIDTHS) {
      const ctx = await browser.newContext({
        viewport: { width, height: 900 },
        reducedMotion: 'reduce',
      })
      if (opts.cookie) {
        await ctx.addCookies([{ name: 'learnit_onboarded', value: '1', url: base }])
      }
      const page = await ctx.newPage()
      try {
        await page.goto(`${base}${route}`, { waitUntil: 'networkidle' })
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        )
        if (overflow > 1) {
          failures++
          console.log(`OVERFLOW ${overflow}px ${width}w ${route}`)
        }
        const file = join(opts.out, `${width}-${route.replaceAll('/', '_')}.png`)
        await page.screenshot({ path: file })
      } catch (err) {
        failures++
        console.log(`OVERFLOW-ERROR ${width}w ${route}: ${err.message.split('\n')[0]}`)
      } finally {
        await ctx.close()
      }
    }
  }
} finally {
  await browser.close()
}

if (failures === 0) {
  console.log('ALL VIEWPORTS CLEAN')
  process.exit(0)
}
console.log(`${failures} failures`)
process.exit(1)
