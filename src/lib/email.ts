// Free-tier email delivery via Resend (resend.com) — no domain verification
// required when sending from the default onboarding@resend.dev sender.
const RESEND_API_KEY = process.env.RESEND_API_KEY!
const FROM_EMAIL = process.env.BOOKING_FROM_EMAIL || 'iPharmaAI Demos <onboarding@resend.dev>'

interface SendEmailInput {
  to: { email: string; name: string }
  subject: string
  html: string
  icsContent?: string
}

export async function sendEmail({ to, subject, html, icsContent }: SendEmailInput): Promise<void> {
  const attachments = icsContent
    ? [{ filename: 'invite.ics', content: Buffer.from(icsContent).toString('base64') }]
    : undefined

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [`${to.name} <${to.email}>`],
      subject,
      html,
      attachments,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Resend send failed (${res.status}): ${err}`)
  }
}
