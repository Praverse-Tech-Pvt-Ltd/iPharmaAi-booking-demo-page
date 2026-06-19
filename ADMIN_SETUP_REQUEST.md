# Action needed from iCretegy IT / Microsoft 365 admin

The booking page sends confirmation emails from `icretools@icretegy.com` using
direct SMTP. Microsoft 365 disables SMTP AUTH (basic authentication) tenant-wide
by default since 2022, so it currently fails with:

```
535 5.7.139 Authentication unsuccessful, the request did not meet the
criteria to be authenticated successfully.
```

This is **not** a wrong password — it's a tenant security setting that only
an admin can change, and only one small step is needed (no full Azure app
registration required for this).

---

## Request to send to the admin (copy-paste)

> Subject: Enable SMTP AUTH for icretools@icretegy.com
>
> Hi — we need Authenticated SMTP (SMTP AUTH) enabled specifically for the
> `icretools@icretegy.com` mailbox so our booking confirmation system can
> send email through it. This is scoped to just this one mailbox, takes
> about 2 minutes, and does not require any app registration or broader
> tenant changes.
>
> Steps (Exchange Admin Center):
> 1. Go to admin.exchange.microsoft.com → Recipients → Mailboxes
> 2. Select `icretools@icretegy.com`
> 3. Click "Manage email apps"
> 4. Enable "Authenticated SMTP"
> 5. Save
>
> Alternatively, via PowerShell (Exchange Online Management module):
> ```powershell
> Connect-ExchangeOnline
> Set-CASMailbox -Identity icretools@icretegy.com -SmtpClientAuthenticationDisabled $false
> ```
>
> Please confirm once done so we can re-test.

---

## Once SMTP AUTH is enabled

No code changes needed. Just confirm `.env.local` has the real values:

```
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
BOOKING_HOST_EMAIL=icretools@icretegy.com
BOOKING_HOST_PASSWORD=<mailbox password>
BOOKING_FROM_EMAIL=iPharmaAI Demos <icretools@icretegy.com>
```

Then re-run the test script:

```
node scripts/test-smtp.js you@example.com
```

A `Sent: <message-id>` line means it worked.

---

## Longer term (optional, separate ask)

For **real MS Teams meeting links** and **calendar availability checks**
(instead of the current Jitsi Meet fallback + always-open slots), a separate,
larger ask is needed: a Microsoft Entra ID App Registration with admin
consent, created by a Global Admin (e.g. `admin@icretegy.on.microsoft.com`).
That's a different, bigger step than the SMTP fix above — see
`.env.local.example` for the exact permissions required
(`Calendars.ReadWrite`, `OnlineMeetings.ReadWrite`, `Mail.Send`).
