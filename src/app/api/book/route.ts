import { NextRequest, NextResponse } from 'next/server'
import { graphPost, BOOKING_EMAIL } from '@/lib/graph'

interface BookingBody {
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  date: string  // "YYYY-MM-DD"
  time: string  // "HH:MM"
}

export async function POST(req: NextRequest) {
  try {
    const body: BookingBody = await req.json()
    const { firstName, lastName, email, phone, company, date, time } = body

    if (!firstName || !lastName || !email || !date || !time) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    // Build start/end ISO strings (30-min slot)
    const [year, month, day] = date.split('-').map(Number)
    const [hour, minute] = time.split(':').map(Number)
    const startDt = new Date(year, month - 1, day, hour, minute)
    const endDt = new Date(startDt.getTime() + 30 * 60 * 1000)
    const toISO = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, '')

    // 1. Create Teams online meeting
    const meeting = await graphPost<{ joinWebUrl: string }>(
      `/users/${BOOKING_EMAIL}/onlineMeetings`,
      {
        startDateTime: `${toISO(startDt)}Z`,
        endDateTime: `${toISO(endDt)}Z`,
        subject: `iPharmaAI Demo — ${firstName} ${lastName}`,
      }
    )
    const teamsUrl = meeting.joinWebUrl

    // 2. Create calendar event with attendee + Teams link
    await graphPost(
      `/users/${BOOKING_EMAIL}/calendar/events`,
      {
        subject: `iPharmaAI Demo — ${firstName} ${lastName}${company ? ` (${company})` : ''}`,
        start: { dateTime: `${toISO(startDt)}`, timeZone: 'UTC' },
        end: { dateTime: `${toISO(endDt)}`, timeZone: 'UTC' },
        body: {
          contentType: 'HTML',
          content: `
            <p>Hi ${firstName},</p>
            <p>Your 30-minute iPharmaAI demo has been confirmed.</p>
            <p><strong>Join MS Teams:</strong> <a href="${teamsUrl}">${teamsUrl}</a></p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
          `,
        },
        location: { displayName: 'Microsoft Teams' },
        isOnlineMeeting: true,
        onlineMeetingUrl: teamsUrl,
        attendees: [
          {
            emailAddress: { address: email, name: `${firstName} ${lastName}` },
            type: 'required',
          },
        ],
      }
    )

    // 3. Send branded confirmation email to the booker
    const dateLabel = startDt.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
    const timeLabel = startDt.toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit', hour12: true,
    })

    await graphPost(
      `/users/${BOOKING_EMAIL}/sendMail`,
      {
        message: {
          subject: 'Your iPharmaAI Demo is Confirmed!',
          body: {
            contentType: 'HTML',
            content: `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f4f8fa;margin:0;padding:32px;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;border:1px solid #d0e4ee;">
    <h2 style="color:#1b6b8c;margin-top:0;">Your demo is confirmed ✓</h2>
    <p style="color:#0c1b26;">Hi ${firstName},</p>
    <p style="color:#5a7a8c;">You're all set for your <strong style="color:#0c1b26;">30-minute iPharmaAI product walkthrough</strong>.</p>
    <div style="background:#f4f8fa;border-radius:8px;padding:16px;margin:24px 0;">
      <p style="margin:0 0 8px;color:#5a7a8c;font-size:13px;">📅 &nbsp;<strong style="color:#0c1b26;">${dateLabel}</strong></p>
      <p style="margin:0 0 8px;color:#5a7a8c;font-size:13px;">⏰ &nbsp;<strong style="color:#0c1b26;">${timeLabel} UTC · 30 minutes</strong></p>
      <p style="margin:0;color:#5a7a8c;font-size:13px;">💻 &nbsp;<a href="${teamsUrl}" style="color:#1b6b8c;font-weight:600;">Join Microsoft Teams</a></p>
    </div>
    <p style="color:#5a7a8c;font-size:13px;">A calendar invite has been sent to your email. If you need to reschedule, reply to this email.</p>
    <p style="color:#5a7a8c;font-size:12px;margin-bottom:0;">— The iPharmaAI Team</p>
  </div>
</body>
</html>
            `.trim(),
          },
          toRecipients: [
            { emailAddress: { address: email, name: `${firstName} ${lastName}` } },
          ],
        },
        saveToSentItems: true,
      }
    )

    return NextResponse.json({ success: true, teamsUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[/api/book]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
