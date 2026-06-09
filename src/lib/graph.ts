const TENANT_ID = process.env.AZURE_TENANT_ID!
const CLIENT_ID = process.env.AZURE_CLIENT_ID!
const CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET!
export const BOOKING_EMAIL = process.env.BOOKING_HOST_EMAIL || 'icretools@icretegy.com'

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0'

let _cachedToken: { value: string; expiresAt: number } | null = null

export async function getGraphToken(): Promise<string> {
  const now = Date.now()
  if (_cachedToken && _cachedToken.expiresAt > now + 60_000) {
    return _cachedToken.value
  }

  const url = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    scope: 'https://graph.microsoft.com/.default',
  })

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to get Graph token: ${err}`)
  }

  const data = await res.json()
  _cachedToken = {
    value: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  }
  return _cachedToken.value
}

export async function graphPost<T = unknown>(path: string, body: unknown): Promise<T> {
  const token = await getGraphToken()
  const res = await fetch(`${GRAPH_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Graph POST ${path} failed (${res.status}): ${err}`)
  }
  return res.json()
}

export async function graphGet<T = unknown>(path: string): Promise<T> {
  const token = await getGraphToken()
  const res = await fetch(`${GRAPH_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Graph GET ${path} failed (${res.status}): ${err}`)
  }
  return res.json()
}
