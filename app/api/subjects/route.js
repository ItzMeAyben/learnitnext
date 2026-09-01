import { NextResponse } from 'next/server'
import { getSubjects } from '../../../lib/store.js'

export async function GET() {
  return NextResponse.json(getSubjects())
}
