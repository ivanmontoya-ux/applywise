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

const INBOUND_SEARCH_PHRASES = [
  '"thank you for applying"',
  '"thank you for your application"',
  '"we received your application"',
  '"your application has been received"',
  '"application confirmation"',
  '"application status"',
  '"your application for"',
  '"application update"',
  '"we regret to inform you"',
  '"unfortunately, we will not be moving forward"',
  '"you have not been selected"',
  '"after careful consideration"',
  '"position has been filled"',
  '"thank you for your interest"',
  '"we are pleased to invite you"',
  '"we would like to invite you"',
  '"job interview"',
  '"interview invitation"',
  '"schedule an interview"',
  '"assessment invitation"',
  '"online assessment"',
  '"next steps in the hiring process"',
  '"recruitment process"',
  '"talent acquisition"',
  '"hiring team"',
  '"offer letter"',
  '"congratulations"',
  '"your candidacy"',
  '"your profile"',
  '"recruiter"',
  '"hiring manager"',
]

const SENT_SEARCH_PHRASES = [
  '"please find attached my CV"',
  '"please find attached my resume"',
  '"I am applying for"',
  '"I would like to apply for"',
  '"thank you for considering my application"',
  '"I am writing to follow up"',
  '"following up on my application"',
  '"attached is my resume"',
  '"attached is my CV"',
  '"attached is my cover letter"',
  '"I look forward to hearing from you"',
  '"thank you for the opportunity to interview"',
  '"I confirm my availability"',
  '"my application"',
  '"cover letter"',
]

const IMPORTANT_STATUS_TYPES = new Set([
  'application_submitted',
  'application_confirmation',
  'interview_invitation',
  'assessment_invitation',
  'rejection',
  'offer',
  'user_sent_application_email',
])

const STOPWORDS = new Set([
  'about', 'after', 'again', 'also', 'analyst', 'application', 'apply', 'business',
  'candidate', 'candidacy', 'career', 'careers', 'company', 'consideration',
  'email', 'follow', 'graduate', 'hello', 'hiring', 'intern', 'internship',
  'letter', 'manager', 'opportunity', 'please', 'position', 'process',
  'recruiter', 'recruiting', 'recruitment', 'regarding', 'resume', 'role',
  'thank', 'thanks', 'team', 'update', 'your',
])

const CATEGORY_RULES = [
  {
    type: 'offer',
    label: 'Offer',
    status: 'Offer',
    action: 'move_to_status',
    actionRequired: 'Review the offer details and update the application outcome.',
    direction: 'inbound',
    patterns: [
      ['offer letter', /\boffer letter\b/i],
      ['pleased to offer', /\b(?:pleased|delighted|happy) to offer\b/i],
      ['congratulations', /\bcongratulations\b/i],
      ['we would like to offer', /\bwe would like to offer\b/i],
      ['employment offer', /\bemployment offer\b/i],
    ],
  },
  {
    type: 'rejection',
    label: 'Rejection',
    status: 'Rejected',
    action: 'move_to_status',
    actionRequired: 'Review the rejection email and move the application to Rejected if it matches.',
    direction: 'inbound',
    patterns: [
      ['we regret to inform you', /\bwe regret to inform you\b/i],
      ['not moving forward', /\b(?:not|will not|won't) (?:be )?moving forward\b/i],
      ['not been selected', /\b(?:not|has not|have not) been selected\b/i],
      ['after careful consideration', /\bafter careful consideration\b/i],
      ['position has been filled', /\bposition has been filled\b/i],
      ['unsuccessful', /\bunsuccessful\b/i],
      ['thank you for your interest', /\bthank you for your interest\b/i],
    ],
  },
  {
    type: 'interview_invitation',
    label: 'Interview invitation',
    status: 'Interview',
    action: 'move_to_status',
    actionRequired: 'Review the interview date and prepare for the next step.',
    direction: 'inbound',
    patterns: [
      ['interview invitation', /\binterview invitation\b/i],
      ['schedule an interview', /\bschedule (?:an|your|the)? ?interview\b/i],
      ['job interview', /\bjob interview\b/i],
      ['we would like to invite you', /\bwe would like to invite you\b/i],
      ['pleased to invite you', /\b(?:pleased|happy|delighted) to invite you\b/i],
      ['phone screen', /\bphone screen\b/i],
      ['video interview', /\bvideo interview\b/i],
      ['meet with', /\bmeet with (?:the )?(?:team|hiring manager|recruiter)\b/i],
    ],
  },
  {
    type: 'assessment_invitation',
    label: 'Assessment or test invitation',
    status: 'Assessment',
    action: 'move_to_status',
    actionRequired: 'Review the assessment details and deadline before completing it.',
    direction: 'inbound',
    patterns: [
      ['assessment invitation', /\bassessment invitation\b/i],
      ['online assessment', /\bonline assessment\b/i],
      ['assessment', /\bassessment\b/i],
      ['online test', /\bonline test\b/i],
      ['case study', /\bcase study\b/i],
      ['take-home', /\btake[- ]home\b/i],
      ['psychometric', /\bpsychometric\b/i],
      ['hirevue', /\bhirevue\b/i],
    ],
  },
  {
    type: 'application_confirmation',
    label: 'Application confirmation',
    status: 'Applied',
    action: 'move_to_status',
    actionRequired: 'Confirm this email belongs to the tracked role and mark it as Applied.',
    direction: 'inbound',
    patterns: [
      ['thank you for applying', /\bthank you for applying\b/i],
      ['thank you for your application', /\bthank you for your application\b/i],
      ['we received your application', /\bwe (?:have )?received your application\b/i],
      ['application has been received', /\byour application has been received\b/i],
      ['application confirmation', /\bapplication confirmation\b/i],
      ['application submitted', /\bapplication (?:has been )?submitted\b/i],
      ['your application for', /\byour application for\b/i],
    ],
  },
  {
    type: 'follow_up_needed',
    label: 'Follow-up needed',
    status: null,
    action: 'add_note',
    actionRequired: 'Review whether this email needs a follow-up or reminder.',
    direction: 'both',
    patterns: [
      ['following up on my application', /\bfollowing up on my application\b/i],
      ['I am writing to follow up', /\bi am writing to follow up\b/i],
      ['please confirm', /\bplease confirm\b/i],
      ['confirm my availability', /\bconfirm my availability\b/i],
      ['next steps in the hiring process', /\bnext steps in the hiring process\b/i],
    ],
  },
  {
    type: 'user_sent_application_email',
    label: 'User-sent application email',
    status: 'Applied',
    action: 'create_or_update_application',
    actionRequired: 'Review the sent email and connect it to the correct application.',
    direction: 'outbound',
    patterns: [
      ['please find attached my CV', /\bplease find attached my c\.?v\.?\b/i],
      ['please find attached my resume', /\bplease find attached my resume\b/i],
      ['I am applying for', /\bi am applying for\b/i],
      ['I would like to apply for', /\bi would like to apply for\b/i],
      ['attached is my resume', /\battached is my resume\b/i],
      ['attached is my CV', /\battached is my c\.?v\.?\b/i],
      ['attached is my cover letter', /\battached is my cover letter\b/i],
      ['thank you for considering my application', /\bthank you for considering my application\b/i],
      ['I look forward to hearing from you', /\bi look forward to hearing from you\b/i],
    ],
  },
  {
    type: 'recruiter_communication',
    label: 'Recruiter communication',
    status: null,
    action: 'review_email',
    actionRequired: 'Review this recruiter communication and decide whether it belongs in the tracker.',
    direction: 'both',
    patterns: [
      ['talent acquisition', /\btalent acquisition\b/i],
      ['hiring team', /\bhiring team\b/i],
      ['hiring manager', /\bhiring manager\b/i],
      ['recruiter', /\brecruiter\b/i],
      ['recruitment process', /\brecruitment process\b/i],
      ['your candidacy', /\byour candidacy\b/i],
      ['your profile', /\byour profile\b/i],
    ],
  },
  {
    type: 'general_application_update',
    label: 'General application update',
    status: null,
    action: 'review_email',
    actionRequired: 'Review the update and decide whether the tracker needs a note or status change.',
    direction: 'inbound',
    patterns: [
      ['application status', /\bapplication status\b/i],
      ['application update', /\bapplication update\b/i],
      ['your application for', /\byour application for\b/i],
      ['recruitment process', /\brecruitment process\b/i],
      ['next steps', /\bnext steps\b/i],
    ],
  },
]

function clean(value, max = 1000) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

function normalizeText(value) {
  return clean(value, 20000).replace(/\s+/g, ' ')
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
  const secret = process.env.GMAIL_TOKEN_ENCRYPTION_KEY || process.env.GOOGLE_CLIENT_SECRET

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

function parseAddress(value) {
  const raw = clean(value, 500)
  const email = normalizeEmailAddress(raw)
  const name = clean(raw.replace(/<[^>]+>/g, '').replace(/^"|"$/g, '').replace(/\s+/g, ' '), 180)
  return { name, email }
}

function parseAddressList(value) {
  return clean(value, 3000)
    .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
    .map(parseAddress)
    .filter(item => item.email)
}

function domainToCompany(email) {
  const domain = normalizeEmailAddress(email).split('@')[1] || ''
  const root = domain
    .replace(/^mail\./, '')
    .replace(/^notifications\./, '')
    .replace(/^no-?reply\./, '')
    .replace(/^careers\./, '')
    .replace(/^jobs\./, '')
    .replace(/^talent\./, '')
    .split('.')[0]
  return root
    ? root.split(/[-_]/).filter(Boolean).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
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

function safeJson(value, fallback = '[]') {
  try {
    return JSON.stringify(value)
  } catch {
    return fallback
  }
}

function parseJson(value, fallback = []) {
  try {
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function getMessageDirection(message, gmailEmail, fromEmail) {
  const labels = message.labelIds || []
  if (labels.includes('SENT')) return 'outbound'
  if (gmailEmail && normalizeEmailAddress(fromEmail) === normalizeEmailAddress(gmailEmail)) return 'outbound'
  return 'inbound'
}

function collectPatternMatches(text, patterns) {
  const matches = []
  for (const [label, regex] of patterns) {
    if (regex.test(text)) matches.push(label)
  }
  return matches
}

function hasRoleContext(text) {
  return /\b(?:internship|intern|graduate|trainee|analyst|associate|consultant|manager|engineer|developer|designer|specialist|coordinator|assistant|business|finance|marketing|sales|operations|strategy|product|data|software|commercial|accounting|audit|role|position)\b/i.test(text)
}

function hasApplicationContext(text) {
  return /\b(?:application|candidacy|candidate|recruitment|hiring process|talent acquisition|hiring team|hiring manager|recruiter|cover letter|resume|c\.?v\.?|interview|assessment|offer)\b/i.test(text)
}

function isFalsePositiveCandidate({ text, subject, fromEmail, direction, directEvidence }) {
  const lower = text.toLowerCase()
  const subjectLower = subject.toLowerCase()
  const domain = normalizeEmailAddress(fromEmail).split('@')[1] || ''
  const genericSender = /(linkedin|indeed|glassdoor|stepstone|monster|reed|totaljobs|adzuna|ziprecruiter|jobrapido|jobs\.|alerts?\.|newsletter)/i.test(domain)
  const genericContent = /\b(?:job alert|jobs you may like|new jobs|recommended jobs|weekly digest|daily digest|newsletter|unsubscribe|sponsored|promotion|advertisement|webinar|course|article|blog|how to prepare|interview tips|resume tips|cv tips|template)\b/i.test(lower)
  const directApplication = /\b(?:thank you for applying|thank you for your application|we received your application|your application has been received|your application for|i am applying for|i would like to apply for|following up on my application|please find attached my c\.?v\.?|attached is my resume)\b/i.test(lower)

  if (directApplication || directEvidence >= 2) return false
  if (direction === 'outbound' && directEvidence >= 1 && hasApplicationContext(text)) return false
  if (genericSender && genericContent) return true
  if (genericContent && !hasApplicationContext(text)) return true
  if (subjectLower.includes('job alert') || subjectLower.includes('jobs you may like')) return true
  return false
}

function classifyEmail({ subject, snippet, body, fromEmail, direction }) {
  const text = normalizeText(`${subject}\n${snippet}\n${body}`)
  const candidates = []

  for (const rule of CATEGORY_RULES) {
    if (rule.direction !== 'both' && rule.direction !== direction) continue
    const matches = collectPatternMatches(text, rule.patterns)
    if (matches.length === 0) continue

    let confidence = 0.46 + matches.length * 0.12
    if (hasApplicationContext(text)) confidence += 0.09
    if (hasRoleContext(text)) confidence += 0.07
    if (rule.status) confidence += 0.06
    if (direction === 'outbound' && rule.type === 'user_sent_application_email') confidence += 0.08
    if (IMPORTANT_STATUS_TYPES.has(rule.type)) confidence += 0.05

    candidates.push({
      ...rule,
      confidence: Math.min(confidence, 0.96),
      matches,
    })
  }

  if (candidates.length === 0) {
    return { type: 'unknown', label: 'Unknown', status: null, action: 'ignore', confidence: 0, reasons: [] }
  }

  candidates.sort((a, b) => b.confidence - a.confidence)
  const best = candidates[0]
  const directEvidence = best.matches.length
  const weakStandaloneEvidence = new Set(['congratulations', 'thank you for your interest', 'assessment', 'please confirm', 'recruiter'])
  const onlyWeakEvidence = best.matches.every(match => weakStandaloneEvidence.has(match))

  if (onlyWeakEvidence && !hasApplicationContext(text)) {
    return { type: 'unknown', label: 'Weak evidence', status: null, action: 'ignore', confidence: 0.28, reasons: [] }
  }
  if (best.type === 'recruiter_communication' && best.matches.length === 1 && !hasRoleContext(text)) {
    return { type: 'unknown', label: 'Weak recruiter evidence', status: null, action: 'ignore', confidence: 0.3, reasons: [] }
  }
  if (isFalsePositiveCandidate({ text, subject, fromEmail, direction, directEvidence })) {
    return { type: 'unknown', label: 'Likely unrelated', status: null, action: 'ignore', confidence: 0.18, reasons: ['Suppressed because it looks like a generic job alert, newsletter, or advice email.'] }
  }

  if (best.confidence < 0.58) {
    return { type: 'unknown', label: 'Weak evidence', status: null, action: 'ignore', confidence: best.confidence, reasons: [] }
  }

  const reasons = [
    ...best.matches.slice(0, 4).map(match => `Detected phrase: "${match}"`),
  ]
  if (hasRoleContext(text)) reasons.push('Email includes role or position context.')
  if (direction === 'outbound') reasons.push('Email was sent by the user.')
  if (direction === 'inbound') reasons.push('Email was received in Gmail.')

  return {
    type: best.type,
    label: best.label,
    status: best.status,
    action: best.action,
    actionRequired: best.actionRequired,
    confidence: Number(best.confidence.toFixed(2)),
    reasons,
  }
}

function cleanExtractedValue(value, max = 90) {
  return clean(value, max)
    .replace(/^["'(:\-\s]+|["').,;:\-\s]+$/g, '')
    .replace(/\s+/g, ' ')
}

function extractRoleTitle(text) {
  const compact = normalizeText(text)
  const patterns = [
    /\byour application for (?:the )?(.{3,90}?)(?: at | with | has | was | is |,|\.|\n|$)/i,
    /\bapplication for (?:the )?(.{3,90}?)(?: at | with | has | was | is |,|\.|\n|$)/i,
    /\binterview for (?:the )?(.{3,90}?)(?: at | with |,|\.|\n|$)/i,
    /\bassessment for (?:the )?(.{3,90}?)(?: at | with |,|\.|\n|$)/i,
    /\bi am applying for (?:the )?(.{3,90}?)(?: at | with |,|\.|\n|$)/i,
    /\bi would like to apply for (?:the )?(.{3,90}?)(?: at | with |,|\.|\n|$)/i,
    /\bposition of (.{3,90}?)(?: at | with |,|\.|\n|$)/i,
    /\brole of (.{3,90}?)(?: at | with |,|\.|\n|$)/i,
  ]

  for (const pattern of patterns) {
    const match = compact.match(pattern)
    if (match?.[1]) {
      const role = cleanExtractedValue(match[1])
      if (role && !/application|interview|assessment|email/i.test(role)) return role
    }
  }

  return ''
}

function extractCompanyName(text, direction, fromEmail, recipients) {
  const compact = normalizeText(text)
  const patterns = [
    /\b(?:at|with) ([A-Z][A-Za-z0-9&.'\- ]{2,60}?)(?: for | regarding | about | as |,|\.|\n|$)/,
    /\bfrom ([A-Z][A-Za-z0-9&.'\- ]{2,60}?)(?: talent| hiring| recruitment| careers| team|,|\.|\n|$)/,
  ]

  for (const pattern of patterns) {
    const match = compact.match(pattern)
    if (match?.[1]) {
      const company = cleanExtractedValue(match[1], 80)
      if (company && !/the|your|this|our|application|role|position/i.test(company)) return company
    }
  }

  if (direction === 'outbound') {
    const firstRecipient = recipients.find(item => item.email)
    return domainToCompany(firstRecipient?.email || '')
  }

  return domainToCompany(fromEmail)
}

function extractDeadlineOrEventDate(text) {
  const compact = normalizeText(text)
  const patterns = [
    /\b(?:interview|meeting|call|assessment|test|deadline|due|scheduled|availability|complete|submit)\b.{0,90}?\b(?:on|by|before|at|until)\b.{0,90}?(?:\.|,|\n|$)/i,
    /\b(?:by|before|on)\b\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{1,2})[^.\n]{0,80}/i,
  ]

  for (const pattern of patterns) {
    const match = compact.match(pattern)
    if (match?.[0]) return cleanExtractedValue(match[0], 220)
  }

  return ''
}

function tokenize(value) {
  return String(value || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(token => token.length >= 4 && !STOPWORDS.has(token))
}

function compactCompany(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

function matchApplication(applications, emailText, companyGuess, roleGuess, senderEmail, recipients) {
  const scored = []
  const text = String(emailText || '').toLowerCase()
  const companyLower = String(companyGuess || '').toLowerCase()
  const roleTokens = tokenize(roleGuess)
  const senderDomain = normalizeEmailAddress(senderEmail).split('@')[1] || ''
  const recipientDomains = recipients.map(item => normalizeEmailAddress(item.email).split('@')[1]).filter(Boolean)

  for (const app of applications) {
    const reasons = []
    const companySignals = []
    const roleSignals = []
    let score = 0
    const company = String(app.company || '').toLowerCase()
    const title = String(app.title || '').toLowerCase()
    const companyKey = compactCompany(company)

    if (company && text.includes(company)) {
      score += 8
      companySignals.push('company name appears in the email')
      reasons.push(`company "${app.company}" appears in the email`)
    }
    if (company && companyLower && companyLower.includes(company)) {
      score += 5
      companySignals.push('inferred company matches the tracked company')
      reasons.push(`company looks like ${app.company}`)
    }
    if (companyKey && senderDomain.replace(/\W+/g, '').includes(companyKey)) {
      score += 5
      companySignals.push('sender domain matches the tracked company')
      reasons.push('sender domain looks related to the company')
    }
    if (companyKey && recipientDomains.some(domain => domain.replace(/\W+/g, '').includes(companyKey))) {
      score += 5
      companySignals.push('recipient domain matches the tracked company')
      reasons.push('recipient domain looks related to the company')
    }

    const titleTokens = tokenize(title)
    const titleHits = titleTokens.filter(token => text.includes(token) || roleTokens.includes(token))
    if (titleHits.length > 0) {
      score += titleHits.length * 2
      roleSignals.push(`${titleHits.length} role word${titleHits.length === 1 ? '' : 's'} matched`)
      reasons.push(`role words matched: ${titleHits.slice(0, 3).join(', ')}`)
    }
    if (title && roleGuess && title.includes(String(roleGuess).toLowerCase())) {
      score += 4
      roleSignals.push('extracted role matches tracked title')
      reasons.push('extracted role matches the tracked title')
    }
    if (title && text.includes(title)) {
      score += 8
      roleSignals.push('full tracked role title appears in the email')
      reasons.push(`role "${app.title}" appears in the email`)
    }

    scored.push({
      application: app,
      score,
      reasons,
      companySignals,
      roleSignals,
      roleHitCount: titleHits.length,
    })
  }

  scored.sort((a, b) => b.score - a.score)
  const best = scored[0]
  const runnerUp = scored[1]

  if (!best || best.score === 0) {
    return {
      application: null,
      score: 0,
      reasons: [],
      reviewReasons: ['No existing application was linked because no strong tracker match was found.'],
    }
  }

  const hasStrongCompany = best.companySignals.length > 0
  const hasStrongRole = best.roleSignals.some(signal => signal.includes('full tracked role') || signal.includes('extracted role')) || best.roleHitCount >= 2
  const clearMargin = !runnerUp || best.score - runnerUp.score >= 5
  const certain = hasStrongCompany && hasStrongRole && clearMargin && best.score >= 12

  if (certain) {
    return { application: best.application, score: best.score, reasons: best.reasons, reviewReasons: [] }
  }

  const missing = [
    hasStrongCompany ? '' : 'company did not match strongly',
    hasStrongRole ? '' : 'role title did not match strongly',
    clearMargin ? '' : 'more than one tracked application looked possible',
  ].filter(Boolean)

  return {
    application: null,
    score: best.score,
    reasons: [],
    reviewReasons: [
      `A possible tracker match was not auto-linked because ${missing.join(' and ') || 'the evidence was not strong enough'}.`,
      'Review the email and create a new manual application or choose an existing tracker item if you know it fits.',
    ],
  }
}

function suggestionCopy({ detected, company, role, application, direction, deadlineOrEventDate }) {
  const target = application
    ? `${application.title} at ${application.company}`
    : role && company
      ? `${role} at ${company}`
      : company
        ? `a possible application at ${company}`
        : role
          ? `a possible ${role} application`
          : 'a possible application'

  const suffix = deadlineOrEventDate ? ` Possible date/detail found: ${deadlineOrEventDate}` : ''

  if (detected.type === 'user_sent_application_email') {
    return {
      title: `Sent application email found for ${target}`,
      body: `Review this sent email and connect it to the right application.${suffix}`,
    }
  }
  if (detected.type === 'follow_up_needed') {
    return {
      title: `Follow-up email found for ${target}`,
      body: `Review whether this should become a tracker note or reminder.${suffix}`,
    }
  }
  if (detected.type === 'interview_invitation') {
    return {
      title: `Interview email found for ${target}`,
      body: `Review the interview details before moving the application to Interview.${suffix}`,
    }
  }
  if (detected.type === 'assessment_invitation') {
    return {
      title: `Assessment email found for ${target}`,
      body: `Review the test or assessment details before moving the application to Assessment.${suffix}`,
    }
  }
  if (detected.type === 'application_confirmation' || detected.type === 'application_submitted') {
    return {
      title: `Application confirmation found for ${target}`,
      body: `Mark this application as Applied if the email belongs to this role.${suffix}`,
    }
  }
  if (detected.type === 'rejection') {
    return {
      title: `Rejection email found for ${target}`,
      body: `Move this application to Rejected after confirming the email belongs to the role.${suffix}`,
    }
  }
  if (detected.type === 'offer') {
    return {
      title: `Offer email found for ${target}`,
      body: `Move this application to Offer after reviewing the offer details.${suffix}`,
    }
  }

  return {
    title: `${direction === 'outbound' ? 'Sent' : 'Received'} application-related email found for ${target}`,
    body: `Review this email and decide whether it should update an application.${suffix}`,
  }
}

function serializeSuggestion(row) {
  return {
    id: row.id,
    application_id: row.application_id,
    email_import_event_id: row.email_import_event_id,
    suggested_action: row.suggested_action,
    suggested_status: row.suggested_status,
    suggested_company: row.suggested_company,
    suggested_role: row.suggested_role,
    suggested_action_required: row.suggested_action_required,
    suggested_title: row.suggested_title,
    suggested_body: row.suggested_body,
    suggested_reminder_date: row.suggested_reminder_date,
    confidence: row.confidence,
    status: row.status,
    created_at: row.created_at,
    email: {
      id: row.email_import_event_id,
      direction: row.direction || 'inbound',
      sender_name: row.sender_name,
      sender_email: row.sender_email || row.from_email,
      recipient_emails: parseJson(row.recipient_emails, []),
      from_email: row.from_email,
      subject: row.subject,
      received_at: row.received_at,
      snippet: row.snippet,
      detected_type: row.detected_type,
      company: row.company,
      job_title: row.job_title,
      application_status: row.application_status,
      action_required: row.action_required,
      deadline_or_event_date: row.deadline_or_event_date,
      gmail_url: row.gmail_url,
      confidence: row.email_confidence ?? row.confidence,
      detection_reasons: parseJson(row.detection_reasons_json, []),
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
  return { accessToken: tokenData.access_token, gmailEmail: row.gmail_email || '' }
}

function buildTimelineNote({ application, suggestion, event, status, company, role, created }) {
  const existing = application?.notes || ''
  const lines = [
    existing,
    existing ? '' : '',
    `Email import: ${suggestion.suggested_title || event.subject || 'Application email'}`,
    created ? `Created from Gmail as ${role || event.job_title || 'Application'} at ${company || event.company || 'Unknown company'}.` : '',
    status ? `Suggested status: ${status}` : '',
    event.direction ? `Direction: ${event.direction === 'outbound' ? 'Sent by user' : 'Received'}` : '',
    event.subject ? `Subject: ${event.subject}` : '',
    event.sender_email ? `Sender: ${event.sender_name ? `${event.sender_name} <${event.sender_email}>` : event.sender_email}` : '',
    event.action_required ? `Action: ${event.action_required}` : '',
    event.deadline_or_event_date ? `Date/detail: ${event.deadline_or_event_date}` : '',
    event.gmail_url ? `Gmail: ${event.gmail_url}` : '',
    event.detection_reasons_json ? `Detected because: ${parseJson(event.detection_reasons_json, []).join('; ')}` : '',
  ].filter(Boolean)
  return clean(lines.join('\n'), 8000)
}

function selectSuggestion(req, id) {
  return getDb().prepare(`
    SELECT
      s.*,
      e.direction,
      e.sender_name,
      e.sender_email,
      e.from_email,
      e.subject,
      e.received_at,
      e.detected_type,
      e.company,
      e.job_title,
      e.application_status,
      e.action_required,
      e.deadline_or_event_date,
      e.gmail_url,
      e.detection_reasons_json
    FROM email_action_suggestions s
    JOIN email_import_events e ON e.id = s.email_import_event_id
    WHERE s.id = ? AND s.user_id = ?
  `).get(id, req.user.id)
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
  const imported = db.prepare(`
    SELECT COUNT(*) as total
    FROM email_import_events
    WHERE user_id = ?
  `).get(req.user.id)

  res.json({
    connected: Boolean(connection && !connection.disconnected_at),
    gmail_email: connection?.gmail_email || '',
    connected_at: connection?.connected_at || null,
    updated_at: connection?.updated_at || null,
    pending_suggestions: pending?.total || 0,
    imported_emails: imported?.total || 0,
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
    const { accessToken, gmailEmail } = await getAccessTokenForUser(userId)
    const applications = db.prepare('SELECT * FROM tracker WHERE user_id = ?').all(userId)
    const messageIds = new Map()

    const queryGroups = [
      ...INBOUND_SEARCH_PHRASES.map(phrase => ({ q: `in:inbox newer_than:365d ${phrase}`, direction: 'inbound' })),
      ...SENT_SEARCH_PHRASES.map(phrase => ({ q: `in:sent newer_than:365d ${phrase}`, direction: 'outbound' })),
    ]

    for (const query of queryGroups) {
      const result = await gmailGet('/messages', accessToken, {
        q: query.q,
        maxResults: 8,
        includeSpamTrash: false,
      })
      for (const message of result.messages || []) {
        if (message?.id && !messageIds.has(message.id)) {
          messageIds.set(message.id, { threadId: message.threadId || '', hintedDirection: query.direction })
        }
      }
    }

    let imported = 0
    let suggestionsCreated = 0
    let suppressed = 0
    let inboundScanned = 0
    let sentScanned = 0

    for (const [messageId, meta] of [...messageIds.entries()].slice(0, 120)) {
      const existing = db.prepare('SELECT id FROM email_import_events WHERE user_id = ? AND gmail_message_id = ?').get(userId, messageId)
      if (existing) continue

      const message = await gmailGet(`/messages/${messageId}`, accessToken, { format: 'full' })
      const subject = clean(getHeader(message, 'Subject'), 500)
      const fromRaw = clean(getHeader(message, 'From'), 500)
      const toRaw = clean(getHeader(message, 'To'), 1600)
      const ccRaw = clean(getHeader(message, 'Cc'), 1600)
      const dateHeader = clean(getHeader(message, 'Date'), 120)
      const from = parseAddress(fromRaw)
      const recipients = [...parseAddressList(toRaw), ...parseAddressList(ccRaw)]
      const direction = getMessageDirection(message, gmailEmail, from.email) || meta.hintedDirection
      if (direction === 'outbound') sentScanned++
      else inboundScanned++

      const receivedAt = parseEmailDate(message.internalDate, dateHeader)
      const body = extractBody(message.payload)
      const snippet = clean(message.snippet, 1000)
      const emailText = `${subject}\n${fromRaw}\n${toRaw}\n${ccRaw}\n${snippet}\n${body}`
      const detected = classifyEmail({ subject, snippet, body, fromEmail: from.email || fromRaw, direction })
      if (detected.type === 'unknown') {
        suppressed++
        continue
      }

      const roleGuess = extractRoleTitle(emailText)
      const companyGuess = extractCompanyName(emailText, direction, from.email || fromRaw, recipients)
      const deadlineOrEventDate = extractDeadlineOrEventDate(emailText)
      const match = matchApplication(applications, emailText, companyGuess, roleGuess, from.email || fromRaw, recipients)
      const application = match.application
      const company = application?.company || companyGuess
      const jobTitle = application?.title || roleGuess
      const reasons = [
        ...detected.reasons,
        ...(application
          ? match.reasons.map(reason => `Matched tracker because ${reason}.`)
          : match.reviewReasons),
        company ? `Company inferred as "${company}".` : '',
        jobTitle ? `Role inferred as "${jobTitle}".` : '',
      ].filter(Boolean)
      const confidence = Math.min(0.98, Number((detected.confidence + (application ? 0.06 : 0)).toFixed(2)))
      const gmailUrl = `https://mail.google.com/mail/u/0/#all/${message.threadId || meta.threadId || messageId}`
      const actionRequired = deadlineOrEventDate
        ? `${detected.actionRequired || 'Review this email.'} Date/detail found: ${deadlineOrEventDate}`
        : detected.actionRequired || 'Review this email before changing the tracker.'

      const eventResult = db.prepare(`
        INSERT INTO email_import_events (
          user_id,
          gmail_message_id,
          thread_id,
          direction,
          sender_name,
          sender_email,
          recipient_emails,
          from_email,
          subject,
          received_at,
          snippet,
          detected_type,
          company,
          job_title,
          application_status,
          action_required,
          deadline_or_event_date,
          gmail_url,
          confidence,
          detection_reasons_json,
          matched_application_id,
          raw_preview
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        messageId,
        message.threadId || meta.threadId,
        direction,
        from.name,
        from.email,
        safeJson(recipients),
        fromRaw,
        subject,
        receivedAt,
        snippet,
        detected.type,
        company,
        jobTitle,
        detected.status,
        actionRequired,
        deadlineOrEventDate,
        gmailUrl,
        confidence,
        safeJson(reasons),
        application?.id || null,
        clean(body || snippet, 2000),
      )
      imported++

      const copy = suggestionCopy({ detected, company, role: jobTitle, application, direction, deadlineOrEventDate })
      db.prepare(`
        INSERT INTO email_action_suggestions (
          user_id,
          application_id,
          email_import_event_id,
          suggested_action,
          suggested_status,
          suggested_company,
          suggested_role,
          suggested_action_required,
          suggested_title,
          suggested_body,
          suggested_reminder_date,
          confidence,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `).run(
        userId,
        application?.id || null,
        eventResult.lastInsertRowid,
        application?.id ? detected.action : 'review_or_create_application',
        detected.status,
        company,
        jobTitle,
        actionRequired,
        copy.title,
        copy.body,
        deadlineOrEventDate || null,
        confidence,
      )
      suggestionsCreated++
    }

    db.prepare(`
      UPDATE gmail_connections
      SET updated_at = datetime('now')
      WHERE user_id = ?
    `).run(userId)

    res.json({
      success: true,
      scanned: messageIds.size,
      inbound_scanned: inboundScanned,
      sent_scanned: sentScanned,
      suppressed,
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
  const params = [req.user.id]
  let statusClause = 'AND s.status = ?'
  if (status === 'all') {
    statusClause = ''
  } else {
    params.push(status)
  }

  const rows = db.prepare(`
    SELECT
      s.*,
      e.direction,
      e.sender_name,
      e.sender_email,
      e.recipient_emails,
      e.from_email,
      e.subject,
      e.received_at,
      e.snippet,
      e.detected_type,
      e.company,
      e.job_title,
      e.application_status,
      e.action_required,
      e.deadline_or_event_date,
      e.gmail_url,
      e.confidence as email_confidence,
      e.detection_reasons_json,
      t.title as app_title,
      t.company as app_company,
      t.status as app_status
    FROM email_action_suggestions s
    JOIN email_import_events e ON e.id = s.email_import_event_id
    LEFT JOIN tracker t ON t.id = s.application_id AND t.user_id = s.user_id
    WHERE s.user_id = ?
    ${statusClause}
    ORDER BY s.created_at DESC
    LIMIT 100
  `).all(...params)
  res.json(rows.map(serializeSuggestion))
})

router.patch('/suggestions/:id', requireAuth, (req, res) => {
  const db = getDb()
  const suggestion = selectSuggestion(req, req.params.id)
  if (!suggestion) return res.status(404).json({ error: 'Suggestion not found.' })
  if (suggestion.status !== 'pending') return res.status(400).json({ error: 'Only pending suggestions can be edited.' })

  const fields = []
  const values = []
  const setText = (column, value, max = 1000) => {
    if (value === undefined) return
    fields.push(`${column} = ?`)
    values.push(clean(value, max) || null)
  }

  if (req.body.application_id !== undefined) {
    const applicationId = req.body.application_id ? Number(req.body.application_id) : null
    if (applicationId) {
      const application = db.prepare('SELECT id FROM tracker WHERE id = ? AND user_id = ?').get(applicationId, req.user.id)
      if (!application) return res.status(404).json({ error: 'Selected application was not found.' })
    }
    fields.push('application_id = ?')
    values.push(applicationId)
  }
  if (req.body.suggested_status !== undefined) {
    const nextStatus = clean(req.body.suggested_status, 40) || null
    if (nextStatus && !APPLICATION_STATUSES.has(nextStatus)) return res.status(400).json({ error: 'Unsupported application status.' })
    fields.push('suggested_status = ?')
    values.push(nextStatus)
  }
  setText('suggested_company', req.body.suggested_company, 160)
  setText('suggested_role', req.body.suggested_role, 160)
  setText('suggested_action_required', req.body.suggested_action_required, 1000)
  setText('suggested_title', req.body.suggested_title, 500)
  setText('suggested_body', req.body.suggested_body, 1000)

  if (fields.length === 0) return res.status(400).json({ error: 'Nothing to update.' })
  fields.push("updated_at = datetime('now')")
  values.push(req.params.id, req.user.id)
  db.prepare(`
    UPDATE email_action_suggestions
    SET ${fields.join(', ')}
    WHERE id = ? AND user_id = ?
  `).run(...values)

  const updated = selectSuggestion(req, req.params.id)
  res.json({ success: true, suggestion: updated })
})

router.post('/suggestions/:id/approve', requireAuth, (req, res) => {
  const db = getDb()
  const suggestion = selectSuggestion(req, req.params.id)

  if (!suggestion) return res.status(404).json({ error: 'Suggestion not found.' })
  if (suggestion.status !== 'pending') return res.status(400).json({ error: 'Suggestion has already been reviewed.' })

  const requestedApplicationId = req.body?.application_id !== undefined
    ? (req.body.application_id ? Number(req.body.application_id) : null)
    : suggestion.application_id
  const hasStatusOverride = Object.prototype.hasOwnProperty.call(req.body || {}, 'suggested_status')
  const status = hasStatusOverride
    ? (clean(req.body?.suggested_status, 40) || null)
    : suggestion.suggested_status || suggestion.application_status || null
  const nextStatus = status && APPLICATION_STATUSES.has(status) ? status : null
  const company = clean(req.body?.suggested_company, 160) || suggestion.suggested_company || suggestion.company || 'Unknown company'
  const role = clean(req.body?.suggested_role, 160) || suggestion.suggested_role || suggestion.job_title || 'Application from Gmail'
  const actionRequired = clean(req.body?.suggested_action_required, 1000) || suggestion.suggested_action_required || suggestion.action_required || ''
  const createIfMissing = req.body?.create_if_missing !== false

  let application = null
  let applicationId = requestedApplicationId
  let created = false

  if (applicationId) {
    application = db.prepare('SELECT * FROM tracker WHERE id = ? AND user_id = ?').get(applicationId, req.user.id)
    if (!application) return res.status(404).json({ error: 'Linked application not found.' })
  } else if (createIfMissing && company && role) {
    const notes = buildTimelineNote({
      application: null,
      suggestion: { ...suggestion, suggested_action_required: actionRequired },
      event: { ...suggestion, action_required: actionRequired },
      status: nextStatus || 'Saved',
      company,
      role,
      created: true,
    })
    const result = db.prepare(`
      INSERT INTO tracker (user_id, title, company, location, url, sector, date_applied, status, notes, is_manual)
      VALUES (?, ?, ?, '', ?, '', ?, ?, ?, 1)
    `).run(
      req.user.id,
      role,
      company,
      suggestion.gmail_url || '',
      nextStatus === 'Applied' ? (suggestion.received_at || new Date().toISOString()) : null,
      nextStatus || 'Saved',
      notes,
    )
    applicationId = result.lastInsertRowid
    application = db.prepare('SELECT * FROM tracker WHERE id = ? AND user_id = ?').get(applicationId, req.user.id)
    created = true
  }

  if (application) {
    const notes = buildTimelineNote({
      application,
      suggestion: { ...suggestion, suggested_action_required: actionRequired },
      event: { ...suggestion, action_required: actionRequired },
      status: nextStatus,
      company,
      role,
      created,
    })
    const fields = ['notes = ?']
    const values = [notes]
    if (nextStatus && APPLICATION_STATUSES.has(nextStatus)) {
      fields.push('status = ?')
      values.push(nextStatus)
      fields.push("date_applied = CASE WHEN ? = 'Applied' AND date_applied IS NULL THEN ? ELSE date_applied END")
      values.push(nextStatus, suggestion.received_at || new Date().toISOString())
    }
    values.push(application.id, req.user.id)
    db.prepare(`UPDATE tracker SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`).run(...values)
  }

  db.prepare(`
    UPDATE email_action_suggestions
    SET
      application_id = ?,
      suggested_status = ?,
      suggested_company = ?,
      suggested_role = ?,
      suggested_action_required = ?,
      status = 'approved',
      updated_at = datetime('now')
    WHERE id = ? AND user_id = ?
  `).run(applicationId || null, nextStatus, company, role, actionRequired, req.params.id, req.user.id)

  db.prepare(`
    UPDATE email_import_events
    SET matched_application_id = COALESCE(?, matched_application_id)
    WHERE id = ? AND user_id = ?
  `).run(applicationId || null, suggestion.email_import_event_id, req.user.id)

  res.json({ success: true, application_id: applicationId || null, created })
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

router.delete('/events/:id', requireAuth, (req, res) => {
  const db = getDb()
  const event = db.prepare('SELECT id FROM email_import_events WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)
  if (!event) return res.status(404).json({ error: 'Imported email record not found.' })

  const deleteRecord = db.transaction(() => {
    db.prepare('DELETE FROM email_action_suggestions WHERE email_import_event_id = ? AND user_id = ?').run(req.params.id, req.user.id)
    db.prepare('DELETE FROM email_import_events WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id)
  })
  deleteRecord()
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
