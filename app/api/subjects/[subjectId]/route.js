import { NextResponse } from 'next/server'
import { getSubjectById } from '../../../../lib/store.js'

export async function GET(request, { params }) {
  const { subjectId } = await params
  let name
  try {
    name = decodeURIComponent(subjectId)
  } catch {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }
  const subject = getSubjectById(name)
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }
  return NextResponse.json(subject)
}
