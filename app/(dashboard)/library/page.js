'use client'

// Library — Phase 2 responsive overhaul (02-06). The @tanstack/react-table
// instance still owns sorting/filtering (columns, counts, filteredData and the
// useReactTable wiring are untouched from Phase 1); only PRESENTATION changed:
// token-driven chrome, 44px filter pills, honest disabled action pills (§9.1),
// the §8/§14.3 tone states, and a §9.5 table→stacked-cards swap on phone
// driven by useViewport (02-RESEARCH Pattern 3 rung 4 — the sanctioned JS
// structural swap; SSR and first client render agree on 'phone', the desktop
// table takes over after mount).

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table'
import { tokens, pill, card, statusPill, useViewport, GLYPHS } from '../../../lib/tokens.js'

const FILTERS = ['All', 'new', 'fetched', 'sorted', 'done', 'failed']

// §12 row 10: the 6-column grid stays for ≥768 (D-05 — desktop preserved).
const GRID_COLUMNS = '1fr 150px 120px 110px 96px 90px'

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

// Visually hidden line (§9.6/§11.3) — same idiom as the sibling screens.
const SR_ONLY = {
  position: 'absolute',
  left: -9999,
  width: 1,
  height: 1,
  overflow: 'hidden',
}

function formatAdded(dateStr) {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
}

function SortIndicator({ column }) {
  const sorted = column.getIsSorted()
  if (!sorted) return null
  return <span style={{ marginLeft: 4 }}>{sorted === 'asc' ? '▲' : '▼'}</span>
}

// §11.3/§10: sorting headers are real buttons (Phase 1 span → button) so the
// global :focus-visible ring covers them; the toggle handler is unchanged.
function SortableHeader({ column, children }) {
  return (
    <button
      type="button"
      onClick={column.getToggleSortingHandler()}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'none',
        border: 0,
        padding: 0,
        font: 'inherit',
        color: 'inherit',
        letterSpacing: 'inherit',
        textTransform: 'inherit',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {children}
      <SortIndicator column={column} />
    </button>
  )
}

export default function LibraryPage() {
  const [statusFilter, setStatusFilter] = useState('All')
  const [sorting, setSorting] = useState([])
  const viewport = useViewport()
  const isPhone = viewport === 'phone'

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['library'],
    queryFn: () => fetch('/api/library').then((r) => r.json()),
  })

  const rows = data || []

  const counts = useMemo(() => {
    const c = { new: 0, fetched: 0, sorted: 0, done: 0, failed: 0 }
    rows.forEach((r) => {
      if (c[r.status] !== undefined) c[r.status] += 1
    })
    return c
  }, [rows])

  const filteredData = useMemo(() => {
    if (statusFilter === 'All') return rows
    return rows.filter((r) => r.status === statusFilter)
  }, [rows, statusFilter])

  // Data logic identical to Phase 1 (accessors, sort toggles, filter model);
  // only the cell PRESENTATION moved onto tokens (statusPill, AA colors).
  const columns = useMemo(
    () => [
      {
        accessorKey: 'title',
        header: ({ column }) => <SortableHeader column={column}>Title</SortableHeader>,
        cell: ({ row }) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm2)', minWidth: 0 }}>
            <div
              aria-hidden="true"
              style={{ width: 38, height: 26, borderRadius: 'var(--radius-sm)', background: 'var(--color-surface-sunken)', flex: 'none' }}
            ></div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: tokens.type.body.size,
                  lineHeight: tokens.type.body.lh,
                  fontWeight: 500,
                  color: 'var(--color-ink)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {row.original.title}
              </div>
              {row.original.status === 'failed' && row.original.error && (
                <div
                  style={{
                    fontSize: tokens.type.caption.size,
                    lineHeight: tokens.type.caption.lh,
                    color: 'var(--color-danger-text)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {row.original.error}
                </div>
              )}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'author',
        header: ({ column }) => <SortableHeader column={column}>Author</SortableHeader>,
        cell: (info) => <span style={CAPTION}>{info.getValue()}</span>,
      },
      {
        accessorKey: 'topic',
        header: ({ column }) => <SortableHeader column={column}>Subject</SortableHeader>,
        cell: (info) => (
          <span
            style={{
              background: 'var(--color-accent-tint)',
              color: 'var(--color-accent-text)',
              borderRadius: 'var(--radius-pill)',
              padding: '4px 10px',
              fontSize: tokens.type.caption.size,
              fontWeight: 700,
              justifySelf: 'start',
            }}
          >
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: 'source',
        header: ({ column }) => <SortableHeader column={column}>Source</SortableHeader>,
        cell: (info) => <span style={CAPTION}>{info.getValue()}</span>,
      },
      {
        accessorKey: 'added',
        header: ({ column }) => <SortableHeader column={column}>Added</SortableHeader>,
        cell: (info) => <span style={CAPTION}>{formatAdded(info.getValue())}</span>,
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <SortableHeader column={column}>Status</SortableHeader>,
        cell: (info) => {
          const status = info.getValue()
          return (
            <span style={{ ...statusPill(status), justifySelf: 'start' }}>
              {status}
              {status === 'failed' && <span style={SR_ONLY}> · status: failed</span>}
            </span>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const total = rows.length

  const stats = [
    { label: 'total rows', value: total, color: 'var(--color-ink)' },
    { label: 'new · waiting to be read', value: counts.new, color: 'var(--color-accent)' },
    { label: 'fetched · not sorted', value: counts.fetched, color: 'var(--color-ink)' },
    { label: 'done', value: counts.done, color: 'var(--color-ink)' },
    { label: 'failed · needs you', value: counts.failed, dark: true },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md2)' }}>
      {/* Header — §12 row 10 phone: the title block stacks above the wrapping action pills */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 'var(--space-md)',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              margin: 0,
              fontSize: tokens.type.display.size,
              lineHeight: tokens.type.display.lh,
              fontWeight: 700,
              letterSpacing: '-1px',
              color: 'var(--color-ink)',
            }}
          >
            Library
          </h1>
          <p style={{ ...BODY, margin: '6px 0 0' }}>{total} saves · you never type in here, the agent fills it in</p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
          {/* §9.1 not-yet-wired action pills — honest disabled buttons, undimmed
              (.btn-undone), no handlers; Phase 4 wires them. */}
          <button
            type="button"
            disabled
            className="btn btn-secondary btn-undone"
            style={pill('secondary')}
            title="Coming in a later update"
          >
            ⌕ Search transcripts
          </button>
          <button
            type="button"
            disabled
            className="btn btn-secondary btn-undone"
            style={pill('secondary')}
            title="Coming in a later update"
          >
            Export CSV
          </button>
          <button
            type="button"
            disabled
            className="btn btn-primary btn-undone"
            style={pill('primary')}
            title="Coming in a later update"
          >
            + Save a link
          </button>
        </div>
      </div>

      {/* Stats — §12 row 10: 5-across ≥1024 / 3-across tablet via one auto-fit
          rule; phone is a 2-col grid with the failed (ink) card spanning both.
          Numerals Display 32 lh 1 (§6); min(100%,…) guard keeps the 180px floor
          from overflowing at 320px content width (WCAG 1.4.10). */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isPhone ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
          gap: 'var(--space-sm2)',
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              ...card(stat.dark ? { dark: true } : {}),
              ...(isPhone && stat.dark ? { gridColumn: 'span 2' } : {}),
            }}
          >
            <div
              style={{
                fontSize: tokens.type.display.size,
                lineHeight: 1,
                fontWeight: 700,
                letterSpacing: '-1px',
                color: stat.dark ? 'var(--color-danger-bright)' : stat.color,
              }}
            >
              {stat.value}
            </div>
            <div style={{ ...CAPTION, color: stat.dark ? 'var(--color-on-dark-secondary)' : 'var(--color-text-secondary)' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Table card: filters + the viewport-swapped row presentation + states */}
      <div style={card()}>
        {isLoading ? (
          /* §14.3 loading: 6 row-sized skeletons (§9.6), never bare text */
          <div aria-busy="true" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm2)', paddingTop: 'var(--space-xs)' }}>
            <span style={SR_ONLY}>Fetching your saves…</span>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton" style={{ height: 56, borderRadius: 'var(--radius-lg)' }} />
            ))}
          </div>
        ) : isError ? (
          /* §14.3/§9.8 error: one calm danger line + Retry, role=alert */
          <div
            role="alert"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 'var(--space-sm2)',
              padding: 'var(--space-sm2) 0',
            }}
          >
            <p style={{ ...BODY, color: 'var(--color-danger-text)' }}>Couldn't load the library — check the pipeline.</p>
            <button type="button" className="btn btn-primary" style={pill('primary')} onClick={() => refetch()}>
              Retry
            </button>
          </div>
        ) : rows.length === 0 ? (
          /* §8 flagship empty state (§9.7 idiom) — copy VERBATIM */
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 'var(--space-sm2)',
              padding: 'var(--space-xl2) var(--space-md)',
            }}
          >
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
              }}
            >
              {GLYPHS.text}
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
              Nothing saved yet
            </div>
            <p style={{ ...BODY, maxWidth: 420 }}>
              Send your first link — save a video to your Learn playlist or forward it to your Telegram bot. It lands here, and
              the overnight run does the rest.
            </p>
            <Link href="/onboarding" className="btn btn-ghost" style={pill('ghost')}>
              See the four doors
            </Link>
          </div>
        ) : (
          <>
            {/* Filter pills — 44px touch targets; the row wraps to two rows at
                360 naturally. Inactive pills take .btn-ghost for its hover; the
                ACTIVE pill drops the variant class and owns its ink colors
                inline (ownership rule — no hover conflict). */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
              {FILTERS.map((filter) => {
                const isActive = statusFilter === filter
                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setStatusFilter(filter)}
                    className={isActive ? 'btn' : 'btn btn-ghost'}
                    style={{
                      ...pill('ghost'),
                      padding: '8px 16px',
                      fontSize: 12.5,
                      fontWeight: 600,
                      ...(isActive ? { background: 'var(--color-ink)', color: '#fff' } : {}),
                    }}
                  >
                    {filter}
                    {filter === 'failed' ? ` ${counts.failed}` : ''}
                  </button>
                )
              })}
            </div>

            {table.getRowModel().rows.length === 0 ? (
              /* §14.3 empty filter — informational, not error (§9.7 minus CTA) */
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: 'var(--space-sm2)',
                  padding: 'var(--space-xl2) var(--space-md)',
                }}
              >
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
                  }}
                >
                  {GLYPHS.search}
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
                  Nothing at this stage right now.
                </div>
                <p style={{ ...BODY, maxWidth: 340 }}>Switch filters or check back after tonight's run.</p>
              </div>
            ) : isPhone ? (
              /* §9.5 phone cards — role=list/listitem (headers dropped; one
                 consistent role model per width). Reads row.original directly:
                 a true mobile card, not a squeezed grid. The react-table
                 instance still owns the order (sort) and the row set (filter). */
              <div role="list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm2)' }}>
                {table.getRowModel().rows.map((row) => {
                  const item = row.original
                  return (
                    <div
                      key={row.id}
                      role="listitem"
                      style={{
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--space-sm2)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-xs)',
                      }}
                    >
                      {/* line 1: title (Body 14/700, truncated) + status pill right */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-sm2)' }}>
                        <div
                          style={{
                            minWidth: 0,
                            fontSize: tokens.type.body.size,
                            lineHeight: tokens.type.caption.lh,
                            fontWeight: 700,
                            color: 'var(--color-ink)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.title}
                        </div>
                        <span style={{ ...statusPill(item.status), flex: 'none' }}>{item.status}</span>
                      </div>
                      {/* line 2: caption meta */}
                      <div style={{ ...CAPTION, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.author} · {item.source} · {formatAdded(item.added)}
                      </div>
                      {/* failed rows add the §9.5 error line */}
                      {item.status === 'failed' && item.error && (
                        <div
                          style={{
                            ...CAPTION,
                            color: 'var(--color-danger-text)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.error}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              /* ≥768: the semantic grid table (§11.3) — role=table + sr-only
                 caption, aria-sort columnheaders, flexRender cells, GRID_COLUMNS
                 rows (D-05: desktop layout preserved). */
              <div role="table">
                <div role="caption" style={SR_ONLY}>
                  Your saved links
                </div>
                <div
                  role="row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: GRID_COLUMNS,
                    gap: 'var(--space-sm2)',
                    padding: '0 var(--space-md) var(--space-sm)',
                    borderBottom: '1px solid var(--color-divider)',
                  }}
                >
                  {table.getHeaderGroups().map((headerGroup) =>
                    headerGroup.headers.map((header) => {
                      const sorted = header.column.getIsSorted()
                      return (
                        <span
                          key={header.id}
                          role="columnheader"
                          aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-xs)',
                            fontSize: tokens.type.caption.size,
                            fontWeight: 700,
                            letterSpacing: '.6px',
                            textTransform: 'uppercase',
                            color: 'var(--color-text-secondary)',
                          }}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                      )
                    })
                  )}
                </div>
                {table.getRowModel().rows.map((row) => (
                  <div
                    key={row.id}
                    role="row"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: GRID_COLUMNS,
                      gap: 'var(--space-sm2)',
                      alignItems: 'center',
                      padding: 'var(--space-sm2) var(--space-md)',
                      borderTop: '1px solid var(--color-divider)',
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <div key={cell.id} role="cell" style={{ minWidth: 0 }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
