# Port of src/lib/meeting.ts — free, no-signup video meeting links via Jitsi Meet.
# Swap this out for Graph's /onlineMeetings once Azure admin consent is granted.
import re
import time

_BASE36_DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz'


def _to_base36(n: int) -> str:
    if n == 0:
        return '0'
    out = []
    while n:
        n, r = divmod(n, 36)
        out.append(_BASE36_DIGITS[r])
    return ''.join(reversed(out))


def create_meeting_url(attendee_name: str) -> str:
    sanitized = re.sub(r'[^a-zA-Z0-9]', '', attendee_name)
    timestamp = _to_base36(int(time.time() * 1000))
    return f'https://meet.jit.si/AuditMind-{sanitized}-{timestamp}'
