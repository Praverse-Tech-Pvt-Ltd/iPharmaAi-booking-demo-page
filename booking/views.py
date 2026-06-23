import json
import re
import time
from datetime import datetime, timedelta, timezone

from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods

from .forms import COUNTRIES, SERVICES, BookingForm
from .utils.email import send_email
from .utils.ics import IcsInput, build_ics
from .utils.meeting import create_meeting_url


BENEFITS = [
    'AI-powered prescription management & error detection',
    'Real-time drug interaction alerts before dispensing',
    'Smart inventory forecasting — eliminate stockouts',
    'Seamless EHR & PMS integration in days, not months',
    'HIPAA-compliant, enterprise-grade security',
]


@ensure_csrf_cookie
def page(request):
    return render(request, 'booking/page.html', {
        'countries': COUNTRIES,
        'services': SERVICES,
        'benefits': BENEFITS,
    })


def _format_date_label(dt: datetime) -> str:
    # Matches JS toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric', timeZone:'UTC' })
    return f'{dt.strftime("%A, %B")} {dt.day}, {dt.year}'


def _format_time_label(dt: datetime) -> str:
    # Matches JS toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit', hour12:true, timeZone:'UTC' })
    hour12 = dt.hour % 12 or 12
    period = 'AM' if dt.hour < 12 else 'PM'
    return f'{hour12}:{dt.minute:02d} {period}'


def _confirmation_html(*, first_name, attendee_name, date_label, time_label, meeting_url, service, question):
    service_row = f'<p style="color:#5a7a8c;font-size:13px;"><strong style="color:#0c1b26;">Requested service:</strong> {service}</p>' if service else ''
    question_row = f'<p style="color:#5a7a8c;font-size:13px;"><strong style="color:#0c1b26;">Your question:</strong> {question}</p>' if question else ''
    return f'''<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f4f8fa;margin:0;padding:32px;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;border:1px solid #d0e4ee;">
    <h2 style="color:#1b6b8c;margin-top:0;">Your demo is confirmed</h2>
    <p style="color:#0c1b26;">Hi {first_name},</p>
    <p style="color:#5a7a8c;">You're all set for your <strong style="color:#0c1b26;">30-minute Audit Mind product walkthrough</strong>.</p>
    <div style="background:#f4f8fa;border-radius:8px;padding:16px;margin:24px 0;">
      <p style="margin:0 0 8px;color:#5a7a8c;font-size:13px;"><strong style="color:#0c1b26;">{date_label}</strong></p>
      <p style="margin:0 0 8px;color:#5a7a8c;font-size:13px;"><strong style="color:#0c1b26;">{time_label} UTC - 30 minutes</strong></p>
      <p style="margin:0;color:#5a7a8c;font-size:13px;"><a href="{meeting_url}" style="color:#1b6b8c;font-weight:600;">Join video call</a></p>
    </div>
    {service_row}
    {question_row}
    <p style="color:#5a7a8c;font-size:13px;">A calendar invite is attached to this email. If you need to reschedule, reply to this email.</p>
    <p style="color:#5a7a8c;font-size:12px;margin-bottom:0;">- The Audit Mind Team</p>
  </div>
</body>
</html>'''.strip()


def _notify_html(*, attendee_name, email, phone, country, company, company_domain, service, question, date_label, time_label, meeting_url):
    rows = []
    rows.append(f'<p><strong>Attendee:</strong> {attendee_name} ({email})</p>')
    if phone:
        rows.append(f'<p><strong>Phone:</strong> {phone}</p>')
    if country:
        rows.append(f'<p><strong>Country:</strong> {country}</p>')
    if company:
        rows.append(f'<p><strong>Company:</strong> {company}</p>')
    if company_domain:
        rows.append(f'<p><strong>Company Domain:</strong> {company_domain}</p>')
    if service:
        rows.append(f'<p><strong>Service:</strong> {service}</p>')
    if question:
        rows.append(f'<p><strong>Question:</strong> {question}</p>')
    rows.append(f'<p><strong>When:</strong> {date_label} at {time_label} UTC</p>')
    rows.append(f'<p><strong>Join video call:</strong> <a href="{meeting_url}">{meeting_url}</a></p>')
    return '<p>New demo booked.</p>' + ''.join(rows)


@require_http_methods(['POST'])
def book_api(request):
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON body.'}, status=400)

    form = BookingForm(body)
    if not form.is_valid():
        first_error = next(iter(form.errors.values()))[0]
        return JsonResponse({'error': first_error}, status=400)

    data = form.cleaned_data
    attendee_name = data['full_name'] or f"{data['first_name']} {data['last_name']}".strip()

    try:
        year, month, day = (int(p) for p in data['date'].split('-'))
        hour, minute = (int(p) for p in data['time'].split(':'))
        start_dt = datetime(year, month, day, hour, minute, tzinfo=timezone.utc)
    except ValueError:
        return JsonResponse({'error': 'Invalid date or time.'}, status=400)

    end_dt = start_dt + timedelta(minutes=30)
    meeting_url = create_meeting_url(attendee_name)

    date_label = _format_date_label(start_dt)
    time_label = _format_time_label(start_dt)

    ics_content = build_ics(IcsInput(
        uid=f'auditmind-demo-{int(time.time() * 1000)}@icretegy.com',
        start=start_dt,
        end=end_dt,
        summary=f'Audit Mind Demo - {attendee_name}',
        description=f'30-minute Audit Mind product walkthrough.\nJoin video call: {meeting_url}',
        location=meeting_url,
        organizer_email=settings.BOOKING_HOST_EMAIL,
        attendee_email=data['email'],
        attendee_name=attendee_name,
    ))

    confirmation_html = _confirmation_html(
        first_name=data['first_name'],
        attendee_name=attendee_name,
        date_label=date_label,
        time_label=time_label,
        meeting_url=meeting_url,
        service=data['service'],
        question=data['question'],
    )

    notify_html = _notify_html(
        attendee_name=attendee_name,
        email=data['email'],
        phone=data['phone'],
        country=data['country'],
        company=data['company'],
        company_domain=data['company_domain'],
        service=data['service'],
        question=data['question'],
        date_label=date_label,
        time_label=time_label,
        meeting_url=meeting_url,
    )

    try:
        send_email(
            to_email=data['email'],
            to_name=attendee_name,
            subject='Your Audit Mind Demo is Confirmed!',
            html=confirmation_html,
            ics_content=ics_content,
        )
        send_email(
            to_email=settings.BOOKING_HOST_EMAIL,
            to_name='Audit Mind Team',
            subject=f'New demo booking — {attendee_name}',
            html=notify_html,
            ics_content=ics_content,
        )
    except Exception as err:
        return JsonResponse({'error': str(err)}, status=500)

    return JsonResponse({'success': True, 'meetingUrl': meeting_url})


@require_http_methods(['GET'])
def availability_api(request):
    date = request.GET.get('date')
    if not date or not re.match(r'^\d{4}-\d{2}-\d{2}$', date):
        return JsonResponse({'error': 'Invalid date param. Use YYYY-MM-DD.'}, status=400)

    # Without real calendar access there's no schedule to check against, so
    # every slot is reported open — same intentional gap as the Next.js
    # version. Swap this for a real calendar/Graph integration later.
    return JsonResponse({'bookedSlots': []})
