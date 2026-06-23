# Port of src/lib/workEmail.ts — personal-email-domain blocklist.
PERSONAL_EMAIL_DOMAINS = {
    'gmail.com',
    'yahoo.com',
    'outlook.com',
    'hotmail.com',
    'live.com',
    'icloud.com',
    'aol.com',
    'protonmail.com',
    'proton.me',
    'rediffmail.com',
    'zoho.com',
    'gmx.com',
    'yandex.com',
    'mail.com',
}


def is_personal_email(email: str) -> bool:
    domain = email.rsplit('@', 1)[-1].lower().strip() if '@' in email else ''
    return bool(domain) and domain in PERSONAL_EMAIL_DOMAINS
