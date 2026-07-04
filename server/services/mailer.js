function clean(value, max = 2000) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export function isMailerConfigured() {
  return Boolean(clean(process.env.RESEND_API_KEY, 500) && clean(process.env.DIGEST_FROM_EMAIL, 320))
}

export async function sendEmail({ to, subject, html, text }) {
  const apiKey = clean(process.env.RESEND_API_KEY, 500)
  const from = clean(process.env.DIGEST_FROM_EMAIL, 320)

  if (!apiKey || !from) {
    const err = new Error('Email sending is not configured. Add RESEND_API_KEY and DIGEST_FROM_EMAIL to server/.env.')
    err.status = 503
    throw err
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      text,
    }),
  })

  const rawText = await response.text()
  let data = null
  try {
    data = rawText ? JSON.parse(rawText) : null
  } catch {
    data = null
  }

  if (!response.ok) {
    const err = new Error(data?.message || rawText || 'Digest email could not be sent by the email provider.')
    err.status = response.status >= 500 ? 502 : 400
    err.provider = 'resend'
    err.providerStatus = response.status
    throw err
  }

  return {
    provider: 'resend',
    id: data?.id || null,
  }
}
