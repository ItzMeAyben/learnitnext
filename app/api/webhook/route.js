import { NextResponse } from 'next/server'
import { addLibraryRow } from '../../../lib/store.js'

// Stands in for the Make.com "Webhooks > Custom webhook" + "Baserow > Create a Row" scenario
// from the guide's Setup 3: the browser extension (or a relay for SMS) posts a plain JSON body
// here instead, and this route writes the library row directly.
export async function POST(request) {
  const body = await request.json().catch(() => null)
  if (!body?.url) {
    return NextResponse.json({ error: 'url is required' }, { status: 400 })
  }
  const row = addLibraryRow({ url: body.url, note: body.note, source: body.source ?? 'browser' })
  return NextResponse.json(row, { status: 201 })
}
