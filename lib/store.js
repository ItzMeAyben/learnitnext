// In-memory stand-in for the Baserow "library" table described in the build guide.
// ponytail: module-level array, resets on server restart — swap for a real Postgres/Baserow
// client behind the same function signatures when you wire up a real DB.

// Single source for the learner's first name (D-03): Today's hero imports it,
// Session consumes it in 02-11 — ends the Iven/Sam copy split.
export const LEARNER_NAME = 'Iven'

export const SUBJECTS = [
  {
    id: 'AI Agents',
    color: '#6c3ce9',
    tileColor: '#6c3ce9',
    blurb:
      "Built from 24 sources, ordered the way your study guide introduces them — memory before tools, tools before evaluation.",
    sourceCount: 24,
    docsBuilt: 3,
    readPct: 62,
    lastQuiz: '8/12',
    source1: 'Evaluating tool-use failures in the wild',
    source2: 'Why your agent loops forever',
    moreSourcesCount: 7,
    sourceBreakdown: [
      { label: 'YouTube', pct: 70, count: 17, color: '#6c3ce9' },
      { label: 'Browser', pct: 25, count: 5, color: '#ffd84d' },
      { label: 'Telegram', pct: 10, count: 2, color: '#22c55e' },
    ],
    stages: [
      { title: 'Stage 1 · Foundations', desc: 'What an agent is, the loop, why demos break in week two · 3 sources', status: 'done' },
      { title: 'Stage 2 · Memory', desc: "What to keep, what to drop, and why context windows aren't the fix · 6 sources", status: 'done' },
      { title: 'Stage 3 · Tool use', desc: 'Failure modes, retries, and when a tool call should just stop · 9 sources · 4 read', status: 'active' },
      { title: 'Stage 4 · Evaluation', desc: 'Judging an agent without a benchmark · 6 sources · unlocks after Stage 3', status: 'locked' },
    ],
  },
  {
    id: 'Distribution',
    color: '#a06a00',
    tileColor: '#ffd84d',
    blurb: 'Built from 9 sources on getting a product in front of people without a marketing budget.',
    sourceCount: 9,
    docsBuilt: 1,
    readPct: 44,
    lastQuiz: '—',
    source1: 'The distribution playbook nobody reads',
    source2: 'Cold outbound in 2026',
    moreSourcesCount: 4,
    sourceBreakdown: [
      { label: 'Telegram', pct: 60, count: 5, color: '#22c55e' },
      { label: 'YouTube', pct: 30, count: 3, color: '#6c3ce9' },
      { label: 'Browser', pct: 10, count: 1, color: '#ffd84d' },
    ],
    stages: [
      { title: 'Stage 1 · Channels', desc: 'Where your first 100 users actually come from · 3 sources', status: 'done' },
      { title: 'Stage 2 · Content', desc: 'Writing and posting on a schedule you can keep · 3 sources', status: 'active' },
      { title: 'Stage 3 · Outbound', desc: 'Cold email and DMs that get replies · 3 sources', status: 'locked' },
    ],
  },
  {
    id: 'Sales',
    color: '#12121a',
    tileColor: '#12121a',
    blurb: 'Built from 6 sources on running discovery calls and closing without a sales team.',
    sourceCount: 6,
    docsBuilt: 1,
    readPct: 30,
    lastQuiz: '—',
    source1: 'Discovery calls that find the real problem',
    source2: 'Pricing for single-operator software',
    moreSourcesCount: 2,
    sourceBreakdown: [
      { label: 'Browser', pct: 50, count: 3, color: '#ffd84d' },
      { label: 'YouTube', pct: 50, count: 3, color: '#6c3ce9' },
    ],
    stages: [
      { title: 'Stage 1 · Discovery', desc: 'Asking questions that surface the real budget and blocker · 3 sources', status: 'done' },
      { title: 'Stage 2 · Closing', desc: 'Pricing, objections, and knowing when to walk · 3 sources', status: 'locked' },
    ],
  },
]

let library = [
  { id: 1, title: 'How agent memory actually works', author: 'Latent Space', topic: 'AI Agents', source: 'youtube', added: '2026-08-13', status: 'done' },
  { id: 2, title: 'The distribution playbook nobody reads', author: '—', topic: 'Distribution', source: 'telegram', added: '2026-08-13', status: 'done' },
  { id: 3, title: 'Pricing for single-operator software', author: 'Jason Cohen', topic: 'Unsorted', source: 'browser', added: '2026-08-13', status: 'sorted' },
  { id: 4, title: 'Cold outbound in 2026', author: '30 Minutes to PMF', topic: 'Sales', source: 'youtube', added: '2026-08-12', status: 'fetched' },
  { id: 5, title: 'Notes on retrieval quality', author: '—', topic: '—', source: 'browser', added: '2026-08-12', status: 'failed', error: 'error: 402 paywall — 218 characters returned, treated as a failure' },
  { id: 6, title: 'Scheduling long-running agents', author: '—', topic: 'AI Agents', source: 'telegram', added: '2026-08-11', status: 'new' },
]
let nextLibraryId = library.length + 1

let pipelineSteps = [
  { n: '01', name: 'learning-capture', desc: 'Playlist read · 4 new rows', time: '6:00:02 · 11s', status: 'ok' },
  { n: '02', name: 'learning-inbox', desc: '2 links · 1 duplicate skipped', time: '6:00:14 · 6s', status: 'ok' },
  { n: '03', name: 'learning-fetch', desc: '6 read · 1 failed (paywall)', time: '6:00:21 · 2m 40s', status: 'warn' },
  { n: '04', name: 'learning-sort', desc: '6 sorted · 1 new subject', time: '6:03:01 · 22s', status: 'ok' },
  { n: '05', name: 'learning-build', desc: '3 notebooks · 9 docs built', time: '6:03:23 · 38s', status: 'active' },
  { n: '06', name: 'learning-digest', desc: 'Telegram sent · 6:04am', time: '6:04:01 · 3s', status: 'ok' },
]

let runLog = [
  { t: '6:00:02', msg: 'capture · feed returned 15 entries' },
  { t: '6:00:09', msg: 'capture · +4 rows status=new', highlight: '+4 rows' },
  { t: '6:00:14', msg: 'inbox · 3 updates, 1 duplicate' },
  { t: '6:00:21', msg: 'fetch · transcript ok (14,206 chars)' },
  { t: '6:01:47', msg: 'fetch · failed 218 chars, paywall', bad: true },
  { t: '6:03:01', msg: 'sort · matched 5 to existing subjects' },
  { t: '6:03:14', msg: 'sort · new subject "Pricing"', highlight: 'new subject' },
  { t: '6:03:23', msg: 'build · notebook AI Agents +3 sources' },
  { t: '6:03:55', msg: 'build · study-guide, briefing-doc, quiz' },
  { t: '6:04:01', msg: 'digest · telegram 200 ok' },
]

let lastRunAt = '6:04am'

export function getSubjects() {
  return SUBJECTS
}

export function getSubjectById(id) {
  return SUBJECTS.find((s) => s.id === id)
}

export function getLibrary() {
  return library
}

export function addLibraryRow({ url, note, source = 'browser' }) {
  const row = {
    id: nextLibraryId++,
    title: url,
    author: '—',
    topic: 'Unsorted',
    source,
    added: new Date().toISOString().slice(0, 10),
    status: 'new',
    note,
  }
  library = [row, ...library]
  return row
}

export function getPipeline() {
  return { steps: pipelineSteps, runLog, lastRunAt }
}

export function runPipelineNow() {
  lastRunAt = new Date().toTimeString().slice(0, 5)
  pipelineSteps = pipelineSteps.map((s) => ({ ...s, status: 'ok', time: `${lastRunAt} · re-run` }))
  runLog = [...runLog, { t: lastRunAt, msg: 'manual run triggered from dashboard', highlight: 'manual run' }]
  return getPipeline()
}

export const QUIZ_ITEMS = [
  { letter: 'A', label: 'Raise the model temperature so it varies its plan', correct: false },
  { letter: 'B', label: 'What the agent is carrying in memory between turns', correct: true },
  { letter: 'C', label: 'Whether the tool schema names are too long', correct: false },
  { letter: 'D', label: 'The number of sources in the notebook', correct: false },
]
