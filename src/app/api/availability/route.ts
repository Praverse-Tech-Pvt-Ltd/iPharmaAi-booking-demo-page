import { NextRequest, NextResponse } from 'next/server'
import { graphPost, BOOKING_EMAIL } from '@/lib/graph'

interface ScheduleItem {
  scheduleItems?: {
    start: { dateTime: string }
    end: { dateTime: string }
    status: string
  }[]
}

// Returns booked HH:MM slots for a given YYYY-MM-DD date (UTC)
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const date = searchParams.get('date') // "YYYY-MM-DD"

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date param. Use YYYY-MM-DD.' }, { status: 400 })
  }

  try {
    const startOfDay = `${date}T00:00:00Z`
    const endOfDay = `${date}T23:59:59Z`

    const data = await graphPost<{ value: ScheduleItem[] }>(
      `/users/${BOOKING_EMAIL}/calendar/getSchedule`,
      {
        schedules: [BOOKING_EMAIL],
        startTime: { dateTime: startOfDay, timeZone: 'UTC' },
        endTime: { dateTime: endOfDay, timeZone: 'UTC' },
        availabilityViewInterval: 30,
      }
    )

    const items = data.value?.[0]?.scheduleItems ?? []

    // Convert busy blocks → set of "HH:MM" slot strings that overlap
    const busySlots = new Set<string>()
    for (const item of items) {
      if (item.status === 'free') continue
      const blockStart = new Date(item.start.dateTime + (item.start.dateTime.endsWith('Z') ? '' : 'Z'))
      const blockEnd = new Date(item.end.dateTime + (item.end.dateTime.endsWith('Z') ? '' : 'Z'))

      // Walk 30-min slots from 09:00–17:00 and mark any that overlap with this block
      for (let h = 9; h <= 17; h++) {
        for (const m of [0, 30]) {
          if (h === 17 && m === 30) continue
          const [y, mo, d] = date.split('-').map(Number)
          const slotStart = new Date(Date.UTC(y, mo - 1, d, h, m))
          const slotEnd = new Date(slotStart.getTime() + 30 * 60_000)
          // Overlap: slot starts before block ends AND slot ends after block starts
          if (slotStart < blockEnd && slotEnd > blockStart) {
            busySlots.add(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
          }
        }
      }
    }

    return NextResponse.json({ bookedSlots: Array.from(busySlots) })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[/api/availability]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
