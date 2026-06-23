# Port of src/lib/email.ts — direct SMTP delivery via the icretools@icretegy.com
# mailbox, using Django's mail API for the same host/port/STARTTLS/auth mechanism.
#
# NOTE: this currently fails in production with Microsoft error 535 5.7.139
# (a tenant-level Basic-Auth-disabled policy on the Microsoft 365 side — not a
# code defect, confirmed via verbose SMTP transcript testing on the Next.js
# version). This port intentionally replicates the same mechanism rather than
# working around it; resolving it requires either the tenant admin re-enabling
# SMTP AUTH org-wide / disabling Security Defaults for this mailbox, or
# migrating to Graph API sendMail with admin-consented app permissions.
from django.conf import settings
from django.core.mail import EmailMultiAlternatives, get_connection


def send_email(*, to_email: str, to_name: str, subject: str, html: str, ics_content: str | None = None) -> None:
    connection = get_connection(
        host=settings.EMAIL_HOST,
        port=settings.EMAIL_PORT,
        username=settings.EMAIL_HOST_USER,
        password=settings.EMAIL_HOST_PASSWORD,
        use_tls=True,
    )
    message = EmailMultiAlternatives(
        subject=subject,
        body=html,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[f'"{to_name}" <{to_email}>'],
        connection=connection,
    )
    message.attach_alternative(html, 'text/html')
    if ics_content:
        message.attach('invite.ics', ics_content, 'text/calendar')
    message.send()
