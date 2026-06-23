# Port of src/lib/ics.ts — RFC 5545 VEVENT builder.
import re
from dataclasses import dataclass
from datetime import datetime, timezone


def _escape_text(s: str) -> str:
    s = re.sub(r'[\\,;]', lambda m: '\\' + m.group(0), s)
    return s.replace('\n', '\\n')


def _fmt(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).strftime('%Y%m%dT%H%M%SZ')


@dataclass
class IcsInput:
    uid: str
    start: datetime
    end: datetime
    summary: str
    description: str
    organizer_email: str
    attendee_email: str
    attendee_name: str
    location: str | None = None


def build_ics(data: IcsInput) -> str:
    lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//AuditMind//Booking//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:REQUEST',
        'BEGIN:VEVENT',
        f'UID:{data.uid}',
        f'DTSTAMP:{_fmt(datetime.now(timezone.utc))}',
        f'DTSTART:{_fmt(data.start)}',
        f'DTEND:{_fmt(data.end)}',
        f'SUMMARY:{_escape_text(data.summary)}',
        f'DESCRIPTION:{_escape_text(data.description)}',
        f'LOCATION:{_escape_text(data.location)}' if data.location else '',
        f'ORGANIZER;CN=Audit Mind:mailto:{data.organizer_email}',
        f'ATTENDEE;CN={_escape_text(data.attendee_name)};RSVP=TRUE:mailto:{data.attendee_email}',
        'STATUS:CONFIRMED',
        'SEQUENCE:0',
        'END:VEVENT',
        'END:VCALENDAR',
    ]
    return '\r\n'.join(line for line in lines if line)
