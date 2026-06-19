// Free, no-signup video meeting links via Jitsi Meet.
// Swap this out for Graph's /onlineMeetings once Azure admin consent is granted.
export function createMeetingUrl(attendeeName: string): string {
  const slug = `iPharmaAI-${attendeeName.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now().toString(36)}`
  return `https://meet.jit.si/${slug}`
}
