import { NextResponse } from 'next/server'
import { getPipeline } from '../../../lib/store.js'

export async function GET() {
  return NextResponse.json(getPipeline())
}
