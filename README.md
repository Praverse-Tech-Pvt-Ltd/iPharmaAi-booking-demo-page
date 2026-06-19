# iPharmaAI Booking Demo Page

Next.js booking page for scheduling an iPharmaAI/Audit Mind demo. The flow collects request-demo details, lets the visitor pick a time slot, emails the visitor a confirmation with an `.ics` calendar invite, and sends the booking details to the host mailbox.

## Requirements

- Node.js 20+
- npm
- SMTP access for the booking host mailbox

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file:

```bash
copy .env.local.example .env.local
```

3. Fill in `.env.local`:

```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
BOOKING_HOST_EMAIL=icretools@icretegy.com
BOOKING_HOST_PASSWORD=your-mailbox-password
BOOKING_FROM_EMAIL=iPharmaAI Demos <icretools@icretegy.com>
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production Build

```bash
npm run build
npm run start
```

## Vercel Deployment

Add these environment variables in Vercel before deploying:

- `SMTP_HOST`
- `SMTP_PORT`
- `BOOKING_HOST_EMAIL`
- `BOOKING_HOST_PASSWORD`
- `BOOKING_FROM_EMAIL`

The current app uses generated Jitsi meeting links and email calendar invites. The availability endpoint returns all slots as open until a real calendar integration is connected.
