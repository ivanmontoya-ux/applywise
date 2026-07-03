import crypto from 'crypto'
import express from 'express'
import { getDb } from '../db/database.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GMAIL_API_URL = 'https://gmail.googleapis.com/gmail/v1/users/me'
const DEFAULT_SCOPES = 'https://www.googleapis.com/auth/gmail.readonly'
const APPLICATION_STATUSES = new Set(['Saved', 'Applied', 'Interview', 'Assessment', 'Offer', 'Rejected', 'Withdrawn'])

const SEARCH_QUERIES = [
  '"thank you for applying"',
  '"application received"',
  '"we received your application"',
  '"your application"',
  '"interview invitation"',
  '"schedule an interview"',
  '"phone screen"',
  '"video interview"',
  '"assessment"',
  '"online test"',
  '"case study"',
  '"not moving forward"',
  '"unfortunately"',
  '"offer"',
  '"congratulations"',
]

function clean(value, max = 1000) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

function getGmailConfig() {
  const clientId = clean(process.env.GOOGLE_CLIENT_ID, 500)
  const clientSecret = clean(process.env.GOOGLE_CLIENT_SECRET, 500)
  const redirectUri = clean(process.env.GOOGLE_REDIRECT_URI, 1000) || 'http://localhost:3001/api/integrations/gmail/callback'
  const scopes = clean(process.env.GMAIL_SCOPES, 1000) || DEFAULT_SCOPES

  if (!clientId || !clientSecret) {
    const err = new Error('Google OAuth is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to server/.env.')
    err.status = 503
    throw err
  }

  return { clientId, clientSecret, redirectUri, scopes }
}

function getCryptoSecret() {
  const secret = process.env.GMAIL_TOKEN_ENCRYPTION_KEY
    || process.env.GOOGLE_CLIENT_SECRET

  if (!secret) {
    const err = new Error('Token encryption is not configured.')
    err.status = 503
    throw err
  }

  return crypto.createHash('sha256').update(secret).digest()
}

function encryptToken(value) {
  if (!value) return ''
  const key = getCryptoSecret()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `v1:${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`
}

function decryptToken(value) {
  if (!value) return ''
  if (!value.startsWith('v1:')) return value
  const [, ivRaw, tagRaw, encryptedRaw] = value.split(':')
  const key = getCryptoSecret()
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivRaw, 'base64'))
  decipher.setAuthTag(Buffer.from(tagRaw, 'base64'))
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedRaw, 'base64')),
    decipher.final(),
  ]).toString('utf8')
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString('base64url')
}

function base64UrlDecode(value) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function signState(payload) {
  const { clientSecret } = getGmailConfig()
  return crypto.createHmac('sha256', clientSecret).update(payload).digest('base64url')
}

function createState(userId) {
  const payload = base64UrlEncode(JSON.stringify({
    user_id: userId,
    nonce: crypto.randomBytes(12).toString('hex'),
    iat: Date.now(),
  }))
  return `${payload}.${signState(payload)}`
}

function verifyState(state) {
  const [payload, signature] = String(state || '').split('.')
  if (!payload || !signature || signState(payload) !== signature) {
    const err = new Error('Invalid Gmail connection state.')
    err.status = 400
    throw err
  }

  let parsed
  try {
    parsed = JSON.parse(base64UrlDecode(payload))
  } catch {
    const err = new Error('Invalid Gmail connection state.')
    err.status = 400
    throw err
  }

  if (!parsed.user_id || !parsed.iat || Date.now() - Number(parsed.iat) > 10 * 60 * 1000) {
    const err = new Error('Expired Gmail connection state.')
    err.status = 400
    throw err
  }

  return parsed
}

async function googleRequest(url, options = {}) {
  const response = await fetch(url, options)
  const rawText = await response.text()
  let data = null
  try {
    data = rawText ? JSON.parse(rawText) : null
  } catch {
    data = null
  }

  if (!response.ok) {
    const err = new Error(data?.error_description || data?.error?.message || data?.error || rawText || `Google request failed with ${response.status}`)
    err.status = response.status
    throw err
  }

  return data
}

async function exchangeCodeForTokens(code) {
  const { clientId, clientSecret, redirectUri } = getGmailConfig()
  return googleRequest(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })
}

async function refreshAccessToken(refreshToken) {
  const { clientId, clientSecret } = getGmailConfig()
  return googleRequest(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    }),
  })
}

async function gmailGet(path, accessToken, params = {}) {
  const url = new URL(`${GMAIL_API_URL}${path}`)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value)
  })
  return googleRequest(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

function getHeader(message, name) {
  const headers = message?.payload?.headers || []
  return headers.find(header => header.name?.toLowerCase() === name.toLowerCase())?.value || ''
}

function decodeMessageBody(data) {
  if (!data) return ''
  try {
    return Buffer.from(data, 'base64url').toString('utf8')
  } catch {
    return ''
  }
}

function stripHtml(value) {
  return clean(value
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' '), 12000)
}

function extractBody(payload) {
  if (!payload) return ''
  const parts = []

  function walk(part) {
    if (!part) return
    if (part.mimeType === 'text/plain' && part.body?.data) {
      parts.unshift(decodeMessageBody(part.body.data))
      return
    }
    if (part.mimeType === 'text/html' && part.body?.data) {
      parts.push(stripHtml(decodeMessageBody(part.body.data)))
      return
    }
    if (Array.isArray(part.parts)) part.parts.forEach(walk)
  }

  walk(payload)
  return clean(parts.filter(Boolean).join('\n'), 12000)
}

function normalizeEmailAddress(value) {
  const match = String(value || '').match(/<([^>]+)>/)
  return clean((match ? match[1] : value).toLowerCase(), 320)
}

function domainToCompany(fromEmail) {
  const domain = normalizeEmailAddress(fromEmail).split('@')[1] || ''
  const root = domain
    .replace(/^mail\./, '')
    .replace(/^notifications\./, '')
    .replace(/^careers\./, '')
    .split('.')[0]
  return root
    ? root.split(/[-_]/).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
    : ''
}

function parseEmailDate(internalDate, dateHeader) {
  if (internalDate) {
    const parsed = new Date(Number(internalDate))
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString()
  }

  if (dateHeader) {
    const parsed = new Date(dateHeader)
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString()
  }

  return new Date().toISOString()
}

function classifyEmail({ subject, snippet, body }) {
  const text = `${subject}\n${snippet}\n${body}`.toLowerCase()

  if (/(offer|congratulations|pleased to offer|we are delighted to offer)/i.test(text)) {
    return { type: 'offer', status: 'Offer', action: 'move_to_status', confidence: 0.82 }
  }
  if (/(unfortunately|not moving forward|will not be proceeding|we regret|unsuccessful|decided not to progress)/i.test(text)) {
    return { type: 'rejection', status: 'Rejected', action: 'move_to_status', confidence: 0.82 }
  }
  if (/(interview|phone screen|video interview|meet with|schedule a call|schedule an interview)/i.test(text)) {
    return { type: 'interview_invite', status: 'Interview', action: 'move_to_status', confidence: 0.86 }
  }
  if (/(assessment|online test|case study|take-home|hirevue|codility|testgorilla|psychometric)/i.test(text)) {
    return { type: 'assessment_invite', status: 'Assessment', action: 'move_to_status', confidence: 0.82 }
  }
  if (/(thank you for applying|application received|received your application|your application has been received|application confirmation)/i.test(text)) {
    return { type: 'application_received', status: 'Applied', action: 'move_to_status', confidence: 0.78 }
  }

  return { type: 'unknown', status: null, action: 'review_email', confidence: 0.35 }
}

function matchApplication(applications, emailText, companyGuess) {
  let best = null
  let bestScore = 0
  const text = String(emailText || '').toLowerCase()

  for (const app of applications) {
    let score = 0
    const company = String(app.company || '').toLowerCase()
    const title = String(app.title || '').toLowerCase()
    if (company && text.includes(company)) score += 5
    if (companyGuess && company && companyGuess.toLowerCase().includes(company)) score += 3
    const titleWords = title.split(/\W+/).filter(word => word.length > 4)
    score += titleWords.filter(word => text.includes(word)).length
    if (score > bestScore) {
      best = app
      bestScore = score
    }
  }

  return bestScore >= 3 ? best : null
}

function suggestionCopy({ detected, company, application, subject }) {
  const target = application
    ? `${application.title} at ${application.company}`
    : company
      ? `a possible application at ${company}`
      : 'a possible application'

  if (detected.type === 'interview_invite') {
    return {
      title: `Interview email found for ${target}`,
      body: 'Review the email for the exact date and create an interview prep reminder if it matches your application.',
    }
  }
  if (detected.type === 'assessment_invite') {
    return {
      title: `Assessment email found for ${target}`,
      body: 'Review the email for the assessment deadline and keep the task visible until it is completed.',
    }
  }
  if (detected.type === 'application_received') {
    return {
      title: `Application confirmation found for ${target}`,
      body: 'Mark this application as Applied if this confirmation belongs to the tracker item.',
    }
  }
  if (detected.type === 'rejection') {
    return {
      title: `Rejection email found for ${target}`,
      body: 'Move this application to Rejected if this email belongs to the tracker item.',
    }
  }
  if (detected.type === 'offer') {
    return {
      title: `Offer email found for ${target}`,
      body: 'Move this application to Offer after reviewing the email details.',
    }
  }
  return {
    title: `Application-related email found${subject ? `: ${subject}` : ''}`,
    body: 'Review this email and decide whether it should be linked to an application.',
  }
}

function serializeSuggestion(row) {
  return {
    id: row.id,
    application_id: row.application_id,
    email_import_event_id: row.email_import_event_id,
    suggested_action: row.suggested_action,
    suggested_status: row.suggested_status,
    suggested_title: row.suggested_title,
    suggested_body: row.suggested_body,
    suggested_reminder_date: row.suggested_reminder_date,
    confidence: row.confidence,
    status: row.status,
    created_at: row.created_at,
    email: {
      from_email: row.from_email,
      subject: row.subject,
      received_at: row.received_at,
      snippet: row.snippet,
      detected_type: row.detected_type,
      company: row.company,
      job_title: row.job_title,
    },
    application: row.app_title ? {
      id: row.application_id,
      title: row.app_title,
      company: row.app_company,
      status: row.app_status,
    } : null,
  }
}

async function getAccessTokenForUser(userId) {
  const db = getDb()
  const row = db.prepare(`
    SELECT * FROM gmail_connections
    WHERE user_id = ? AND refresh_token_encrypted IS NOT NULL AND disconnected_at IS NULL
  `).get(userId)

  if (!row) {
    const err = new Error('Connect Gmail before scanning email.')
    err.status = 400
    throw err
  }

  const refreshToken = decryptToken(row.refresh_token_encrypted)
  const tokenData = await refreshAccessToken(refreshToken)
  return tokenData.access_token
}

router.get('/status', (req, res) => {
  if (!req.user?.id) return res.json({ connected: false })

  const db = getDb()
  const connection = db.prepare(`
    SELECT gmail_email, connected_at, updated_at, disconnected_at
    FROM gmail_connections
    WHERE user_id = ?
  `).get(req.user.id)
  const pending = db.prepare(`
    SELECT COUNT(*) as total
    FROM email_action_suggestions
    WHERE user_id = ? AND status = 'pending'
  `).get(req.user.id)

  res.json({
    connected: Boolean(connection && !connection.disconnected_at),
    gmail_email: connection?.gmail_email || '',
    connected_at: connection?.connected_at || null,
    pending_suggestions: pending?.total || 0,
  })
})

router.get('/connect', requireAuth, (req, res) => {
  const { clientId, redirectUri, scopes } = getGmailConfig()
  const url = new URL(GOOGLE_AUTH_URL)
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', scopes)
  url.searchParams.set('access_type', 'offline')
  url.searchParams.set('prompt', 'consent')
  url.searchParams.set('state', createState(req.user.id))
  res.json({ url: url.toString() })
})

router.get('/callback', async (req, res) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
  try {
    const code = clean(req.query.code, 4000)
    const state = clean(req.query.state, 4000)
    if (!code) throw Object.assign(new Error('Missing Google authorization code.'), { status: 400 })

    const { user_id: userId } = verifyState(state)
    const tokenData = await exchangeCodeForTokens(code)
    if (!tokenData.refresh_token) {
      throw Object.assign(new Error('Google did not return a refresh token. Try connecting again and approve offline access.'), { status: 400 })
    }

    const profile = await gmailGet('/profile', tokenData.access_token)
    const db = getDb()
    db.prepare(`
      INSERT INTO gmail_connections (
        user_id,
        gmail_email,
        refresh_token_encrypted,
        scope,
        token_type,
        last_history_id,
        connected_at,
        updated_at,
        disconnected_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), NULL)
      ON CONFLICT(user_id) DO UPDATE SET
        gmail_email = excluded.gmail_email,
        refresh_token_encrypted = excluded.refresh_token_encrypted,
        scope = excluded.scope,
        token_type = excluded.token_type,
        last_history_id = excluded.last_history_id,
        updated_at = datetime('now'),
        disconnected_at = NULL
    `).run(
      userId,
      profile.emailAddress || '',
      encryptToken(tokenData.refresh_token),
      tokenData.scope || '',
      tokenData.token_type || 'Bearer',
      profile.historyId || null,
    )

    res.redirect(`${clientUrl.replace(/\/$/, '')}/email?gmail=connected`)
  } catch (error) {
    const message = encodeURIComponent(error.message || 'Gmail connection failed.')
    res.redirect(`${clientUrl.replace(/\/$/, '')}/email?gmail=error&message=${message}`)
  }
})

router.post('/sync', requireAuth, async (req, res) => {
  try {
    const db = getDb()
    const userId = req.user.id
    const accessToken = await getAccessTokenForUser(userId)
    const applications = db.prepare('SELECT * FROM tracker WHERE user_id = ?').all(userId)
    const messageIds = new Map()

    for (const query of SEARCH_QUERIES) {
      const result = await gmailGet('/messages', accessToken, {
        q: `newer_than:180d ${query}`,
        maxResults: 10,
        includeSpamTrash: false,
      })
      for (const message of result.messages || []) {
        if (message?.id) messageIds.set(message.id, message.threadId || '')
      }
    }

    let imported = 0
    let suggestionsCreated = 0

    for (const [messageId, threadId] of [...messageIds.entries()].slice(0, 40)) {
      const existing = db.prepare('SELECT id FROM email_import_events WHERE user_id = ? AND gmail_message_id = ?').get(userId, messageId)
      if (existing) continue

      const message = await gmailGet(`/messages/${messageId}`, accessToken, { format: 'full' })
      const subject = clean(getHeader(message, 'Subject'), 500)
      const fromEmail = clean(getHeader(message, 'From'), 500)
      const dateHeader = clean(getHeader(message, 'Date'), 120)
      const receivedAt = parseEmailDate(message.internalDate, dateHeader)
      const body = extractBody(message.payload)
      const snippet = clean(message.snippet, 1000)
      const emailText = `${subject}\n${fromEmail}\n${snippet}\n${body}`
      const detected = classifyEmail({ subject, snippet, body })
      if (detected.type === 'unknown') continue

      const companyGuess = domainToCompany(fromEmail)
      const application = matchApplication(applications, emailText, companyGuess)
      const company = application?.company || companyGuess
      const jobTitle = application?.title || ''
      const eventResult = db.prepare(`
        INSERT INTO email_import_events (
          user_id,
          gmail_message_id,
          thread_id,
          from_email,
          subject,
          received_at,
          snippet,
          detected_type,
          company,
          job_title,
          raw_preview
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        messageId,
        message.threadId || threadId,
        fromEmail,
        subject,
        receivedAt,
        snippet,
        detected.type,
        company,
        jobTitle,
        clean(body || snippet, 2000),
      )
      imported++

      const copy = suggestionCopy({ detected, company, application, subject })
      db.prepare(`
        INSERT INTO email_action_suggestions (
          user_id,
          application_id,
          email_import_event_id,
          suggested_action,
          suggested_status,
          suggested_title,
          suggested_body,
          confidence,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `).run(
        userId,
        application?.id || null,
        eventResult.lastInsertRowid,
        application?.id ? detected.action : 'review_or_create_application',
        application?.id ? detected.status : null,
        copy.title,
        copy.body,
        detected.confidence,
      )
      suggestionsCreated++
    }

    res.json({
      success: true,
      scanned: messageIds.size,
      imported,
      suggestions_created: suggestionsCreated,
    })
  } catch (error) {
    const status = error.status && Number.isInteger(error.status) ? error.status : 500
    res.status(status).json({ error: error.message || 'Gmail sync failed.' })
  }
})

router.get('/suggestions', requireAuth, (req, res) => {
  const db = getDb()
  const status = clean(req.query.status, 40) || 'pending'
  const rows = db.prepare(`
    SELECT
      s.*,
      e.from_email,
      e.subject,
      e.received_at,
      e.snippet,
      e.detected_type,
      e.company,
      e.job_title,
      t.title as app_title,
      t.company as app_company,
      t.status as app_status
    FROM email_action_suggestions s
    JOIN email_import_events e ON e.id = s.email_import_event_id
    LEFT JOIN tracker t ON t.id = s.application_id AND t.user_id = s.user_id
    WHERE s.user_id = ? AND s.status = ?
    ORDER BY s.created_at DESC
    LIMIT 100
  `).all(req.user.id, status)
  res.json(rows.map(serializeSuggestion))
})

router.post('/suggestions/:id/approve', requireAuth, (req, res) => {
  const db = getDb()
  const suggestion = db.prepare(`
    SELECT s.*, e.subject, e.from_email, e.received_at, e.detected_type
    FROM email_action_suggestions s
    JOIN email_import_events e ON e.id = s.email_import_event_id
    WHERE s.id = ? AND s.user_id = ?
  `).get(req.params.id, req.user.id)

  if (!suggestion) return res.status(404).json({ error: 'Suggestion not found.' })
  if (suggestion.status !== 'pending') return res.status(400).json({ error: 'Suggestion has already been reviewed.' })

  let application = null
  if (suggestion.application_id && suggestion.suggested_status && APPLICATION_STATUSES.has(suggestion.suggested_status)) {
    application = db.prepare('SELECT * FROM tracker WHERE id = ? AND user_id = ?').get(suggestion.application_id, req.user.id)
    if (!application) return res.status(404).json({ error: 'Linked application not found.' })

    const noteLine = [
      application.notes || '',
      '',
      `Email import: ${suggestion.suggested_title}`,
      suggestion.subject ? `Source email: ${suggestion.subject}` : '',
    ].filter(Boolean).join('\n')

    db.prepare(`
      UPDATE tracker
      SET status = ?, notes = ?, date_applied = CASE WHEN ? = 'Applied' AND date_applied IS NULL THEN ? ELSE date_applied END
      WHERE id = ? AND user_id = ?
    `).run(
      suggestion.suggested_status,
      clean(noteLine, 8000),
      suggestion.suggested_status,
      suggestion.received_at || new Date().toISOString(),
      suggestion.application_id,
      req.user.id,
    )
  }

  db.prepare(`
    UPDATE email_action_suggestions
    SET status = 'approved', updated_at = datetime('now')
    WHERE id = ? AND user_id = ?
  `).run(req.params.id, req.user.id)

  res.json({ success: true, application_id: suggestion.application_id || null })
})

router.post('/suggestions/:id/reject', requireAuth, (req, res) => {
  const result = getDb().prepare(`
    UPDATE email_action_suggestions
    SET status = 'rejected', updated_at = datetime('now')
    WHERE id = ? AND user_id = ? AND status = 'pending'
  `).run(req.params.id, req.user.id)
  if (result.changes === 0) return res.status(404).json({ error: 'Pending suggestion not found.' })
  res.json({ success: true })
})

router.delete('/disconnect', requireAuth, (req, res) => {
  getDb().prepare(`
    UPDATE gmail_connections
    SET refresh_token_encrypted = NULL, disconnected_at = datetime('now'), updated_at = datetime('now')
    WHERE user_id = ?
  `).run(req.user.id)
  res.json({ success: true })
})

export default router
