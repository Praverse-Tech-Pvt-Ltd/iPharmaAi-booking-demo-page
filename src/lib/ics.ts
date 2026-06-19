interface IcsInput {
  uid: string
  start: Date
  end: Date
  summary: string
  description: string
  location?: string
  organizerEmail: string
  attendeeEmail: string
  attendeeName: string
}

const escapeText = (s: string) => s.replace(/[\\,;]/g, m => `\\${m}`).replace(/\n/g, '\\n')

export function buildIcs({
  uid,
  start,
  end,
  summary,
  description,
  location,
  organizerEmail,
  attendeeEmail,
  attendeeName,
}: IcsInput): string {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AuditMind//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${escapeText(summary)}`,
    `DESCRIPTION:${escapeText(description)}`,
    location ? `LOCATION:${escapeText(location)}` : '',
    `ORGANIZER;CN=Audit Mind:mailto:${organizerEmail}`,
    `ATTENDEE;CN=${escapeText(attendeeName)};RSVP=TRUE:mailto:${attendeeEmail}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n')
}
