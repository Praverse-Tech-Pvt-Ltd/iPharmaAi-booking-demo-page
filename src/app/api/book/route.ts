import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { createMeetingUrl } from '@/lib/meeting'
import { buildIcs } from '@/lib/ics'

const BOOKING_EMAIL = process.env.BOOKING_HOST_EMAIL || 'icretools@icretegy.com'

interface BookingBody {
  firstName: string
  lastName: string
  fullName?: string
  email: string
  phone?: string
  company?: string
  country?: string
  companyDomain?: string
  service?: string
  question?: string
  date: string
  time: string
}

export async function POST(req: NextRequest) {
  try {
    const body: BookingBody = await req.json()
    const {
      firstName,
      lastName,
      fullName,
      email,
      phone,
      company,
      country,
      companyDomain,
      service,
      question,
      date,
      time,
    } = body
    const attendeeName = fullName || `${firstName} ${lastName}`.trim()

    if (!firstName || !lastName || !email || !date || !time) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    const [year, month, day] = date.split('-').map(Number)
    const [hour, minute] = time.split(':').map(Number)
    const startDt = new Date(Date.UTC(year, month - 1, day, hour, minute))
    const endDt = new Date(startDt.getTime() + 30 * 60 * 1000)

    const meetingUrl = createMeetingUrl(attendeeName)

    const dateLabel = startDt.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    })
    const timeLabel = startDt.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC',
    })

    const icsContent = buildIcs({
      uid: `ipharmaai-demo-${Date.now()}@icretegy.com`,
      start: startDt,
      end: endDt,
      summary: `iPharmaAI Demo - ${attendeeName}`,
      description: `30-minute iPharmaAI product walkthrough.\nJoin video call: ${meetingUrl}`,
      location: meetingUrl,
      organizerEmail: BOOKING_EMAIL,
      attendeeEmail: email,
      attendeeName,
    })

    const confirmationHtml = `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f4f8fa;margin:0;padding:32px;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;border:1px solid #d0e4ee;">
    <h2 style="color:#1b6b8c;margin-top:0;">Your demo is confirmed</h2>
    <p style="color:#0c1b26;">Hi ${firstName},</p>
    <p style="color:#5a7a8c;">You're all set for your <strong style="color:#0c1b26;">30-minute iPharmaAI product walkthrough</strong>.</p>
    <div style="background:#f4f8fa;border-radius:8px;padding:16px;margin:24px 0;">
      <p style="margin:0 0 8px;color:#5a7a8c;font-size:13px;"><strong style="color:#0c1b26;">${dateLabel}</strong></p>
      <p style="margin:0 0 8px;color:#5a7a8c;font-size:13px;"><strong style="color:#0c1b26;">${timeLabel} UTC - 30 minutes</strong></p>
      <p style="margin:0;color:#5a7a8c;font-size:13px;"><a href="${meetingUrl}" style="color:#1b6b8c;font-weight:600;">Join video call</a></p>
    </div>
    ${service ? `<p style="color:#5a7a8c;font-size:13px;"><strong style="color:#0c1b26;">Requested service:</strong> ${service}</p>` : ''}
    ${question ? `<p style="color:#5a7a8c;font-size:13px;"><strong style="color:#0c1b26;">Your question:</strong> ${question}</p>` : ''}
    <p style="color:#5a7a8c;font-size:13px;">A calendar invite is attached to this email. If you need to reschedule, reply to this email.</p>
    <p style="color:#5a7a8c;font-size:12px;margin-bottom:0;">- The iPharmaAI Team</p>
  </div>
</body>
</html>
    `.trim()

    await sendEmail({
      to: { email, name: attendeeName },
      subject: 'Your iPharmaAI Demo is Confirmed!',
      html: confirmationHtml,
      icsContent,
    })

    const notifyHtml = `
      <p>New demo booked.</p>
      <p><strong>Attendee:</strong> ${attendeeName} (${email})</p>
      ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
      ${country ? `<p><strong>Country:</strong> ${country}</p>` : ''}
      ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
      ${companyDomain ? `<p><strong>Company Domain:</strong> ${companyDomain}</p>` : ''}
      ${service ? `<p><strong>Service:</strong> ${service}</p>` : ''}
      ${question ? `<p><strong>Question:</strong> ${question}</p>` : ''}
      <p><strong>When:</strong> ${dateLabel} at ${timeLabel} UTC</p>
      <p><strong>Join video call:</strong> <a href="${meetingUrl}">${meetingUrl}</a></p>
    `

    await sendEmail({
      to: { email: BOOKING_EMAIL, name: 'iPharmaAI Team' },
      subject: `New demo booking — ${attendeeName}`,
      html: notifyHtml,
      icsContent,
    })

    return NextResponse.json({ success: true, meetingUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[/api/book]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
