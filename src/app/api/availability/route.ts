import { NextRequest, NextResponse } from 'next/server'

// Without Graph calendar access there's no real schedule to check against,
// so every slot is reported open. Swap this for a Graph getSchedule call
// (see src/lib/graph.ts) once Azure admin consent is granted.
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const date = searchParams.get('date')

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date param. Use YYYY-MM-DD.' }, { status: 400 })
  }

  return NextResponse.json({ bookedSlots: [] })
}
