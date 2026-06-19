// Direct SMTP delivery via the icretools@icretegy.com mailbox — no Azure app
// registration or admin consent needed, just the mailbox password.
import nodemailer from 'nodemailer'

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.office365.com'
const SMTP_PORT = Number(process.env.SMTP_PORT || 587)
const SMTP_USER = process.env.BOOKING_HOST_EMAIL!
const SMTP_PASS = process.env.BOOKING_HOST_PASSWORD!
const FROM_EMAIL = process.env.BOOKING_FROM_EMAIL || `Audit Mind Demos <${SMTP_USER}>`

let _transporter: ReturnType<typeof nodemailer.createTransport> | null = null

function getTransporter() {
  if (_transporter) return _transporter
  _transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false, // STARTTLS on port 587
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })
  return _transporter
}

interface SendEmailInput {
  to: { email: string; name: string }
  subject: string
  html: string
  icsContent?: string
}

export async function sendEmail({ to, subject, html, icsContent }: SendEmailInput): Promise<void> {
  const attachments = icsContent
    ? [{ filename: 'invite.ics', content: icsContent, contentType: 'text/calendar' }]
    : undefined

  await getTransporter().sendMail({
    from: FROM_EMAIL,
    to: `"${to.name}" <${to.email}>`,
    subject,
    html,
    attachments,
  })
}
