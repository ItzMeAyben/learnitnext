import { NextResponse } from 'next/server'
import { runPipelineNow } from '../../../../lib/store.js'

export async function POST() {
  return NextResponse.json(runPipelineNow())
}
