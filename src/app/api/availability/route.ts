import { NextRequest, NextResponse } from 'next/server'

// There is no live calendar integration yet, so every slot is reported open.
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const date = searchParams.get('date')

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date param. Use YYYY-MM-DD.' }, { status: 400 })
  }

  return NextResponse.json({ bookedSlots: [] })
}
