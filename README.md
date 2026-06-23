# Audit Mind — Book a Demo (Django)

A full rewrite of the "Book a Demo" page from Next.js to Django templates + vanilla JS. See `ADMIN_SETUP_REQUEST.md` on the `main` branch for the Microsoft 365 SMTP setup context.

## Setup

```
python -m venv venv
venv\Scripts\activate        # Windows
pip install django python-dotenv
cp .env.local.example .env.local   # fill in BOOKING_HOST_PASSWORD
python manage.py migrate
python manage.py runserver
```

Visit `http://localhost:8000/`.

## Project structure

- `auditmind_booking/` — Django project settings, URLs
- `booking/` — the single app: views, forms, validators, and `utils/` (email, ics, meeting-link generation)
- `templates/` — `base.html` + `booking/page.html` (the split-layout page)
- `static/` — CSS, JS (Lightfall WebGL background, theme toggle, booking form state machine), logo images

## Known, intentional gaps (carried over from the original Next.js version)

- **No database/persistence** — `/api/availability` always returns `bookedSlots: []`. There's no real calendar backend yet, so every weekday slot always shows as open. Wire this into a real calendar/DB before going live.
- **SMTP email sending currently fails** with Microsoft error `535 5.7.139` — a Microsoft 365 tenant-level Basic-Auth-disabled policy, not a code defect. See `booking/utils/email.py` for details. Resolving this requires either:
  - The tenant admin enabling SMTP AUTH (both the per-mailbox toggle AND the tenant-wide setting) and checking Security Defaults/Conditional Access policies, or
  - Migrating to Microsoft Graph API's `sendMail` with an admin-consented App Registration (see the commented-out Azure vars in `.env.local.example`).
- **CSRF protection** on `/api/book` and `/api/availability` is new in this Django version (the original Next.js API routes had none) — this is an intentional improvement, not a regression to investigate.

## What's not pixel-perfect vs. the original

- Framer Motion spring physics (hero stagger, step transitions, button press feedback) are approximated with CSS transitions/keyframes, not physically identical spring curves.
- Step transitions are simple hide/show rather than true cross-fade between outgoing/incoming steps.
