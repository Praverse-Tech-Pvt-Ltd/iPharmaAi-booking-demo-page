// One-off SMTP test — run with: node scripts/test-smtp.js you@example.com
const fs = require('fs')
const path = require('path')
const nodemailer = require('nodemailer')

function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local')
  const content = fs.readFileSync(envPath, 'utf-8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const value = trimmed.slice(idx + 1).trim()
    if (!process.env[key]) process.env[key] = value
  }
}

async function main() {
  loadEnvLocal()
  const to = process.argv[2]
  if (!to) {
    console.error('Usage: node scripts/test-smtp.js you@example.com')
    process.exit(1)
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.BOOKING_HOST_EMAIL,
      pass: process.env.BOOKING_HOST_PASSWORD,
    },
    logger: true,
    debug: true,
  })

  console.log(`Mailbox user being authenticated: "${process.env.BOOKING_HOST_EMAIL}", password length: ${(process.env.BOOKING_HOST_PASSWORD || '').length}`)
  await transporter.verify()
  console.log('Connection + AUTH verified OK — server accepted the login.')

  console.log(`Sending test mail to ${to} via ${process.env.SMTP_HOST}:${process.env.SMTP_PORT} as ${process.env.BOOKING_HOST_EMAIL}...`)

  const info = await transporter.sendMail({
    from: process.env.BOOKING_FROM_EMAIL,
    to,
    subject: 'iPharmaAI SMTP test',
    html: '<p>This is a test email confirming SMTP delivery via icretools@icretegy.com is working.</p>',
  })

  console.log('Sent:', info.messageId)
}

main().catch(err => {
  console.error('SMTP test failed:')
  console.error(err)
  process.exit(1)
})
