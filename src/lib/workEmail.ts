const PERSONAL_EMAIL_DOMAINS = new Set([
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
])

export function isPersonalEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase().trim()
  return !!domain && PERSONAL_EMAIL_DOMAINS.has(domain)
}
