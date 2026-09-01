import { NextResponse } from 'next/server'
import { getLibrary } from '../../../lib/store.js'

export async function GET() {
  return NextResponse.json(getLibrary())
}
