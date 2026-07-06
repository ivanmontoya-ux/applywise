import { isMailerConfigured, sendEmail } from './mailer.js'

export const DIGEST_FREQUENCIES = new Set(['daily', 'every_2_days', 'weekly'])

function clean(value, max = 2000) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function escapeHtml(value) {
  return clean(String(value ?? ''), 8000)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function normalizeFrequency(value) {
  return DIGEST_FREQUENCIES.has(value) ? value : 'weekly'
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function nextSendAt(frequency, from = new Date()) {
  const days = normalizeFrequency(frequency) === 'daily'
    ? 1
    : normalizeFrequency(frequency) === 'every_2_days'
      ? 2
      : 7
  const next = new Date(from)
  next.setDate(next.getDate() + days)
  next.setHours(8, 0, 0, 0)
  return next.toISOString()
}

function parseDate(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function daysBetween(from, to = new Date()) {
  const start = parseDate(from)
  if (!start) return null
  return Math.floor((to.getTime() - start.getTime()) / 86400000)
}

function daysUntil(value) {
  const date = parseDate(value)
  if (!date) return null
  return Math.ceil((date.getTime() - new Date().getTime()) / 86400000)
}

function formatDate(value) {
  const date = parseDate(value)
  if (!date) return ''
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function isTerminal(status) {
  return ['Offer', 'Rejected'].includes(status)
}

function defaultPreference(user) {
  return {
    enabled: false,
    frequency: 'weekly',
    recipient_email: user?.email || '',
    last_sent_at: null,
    next_send_at: null,
  }
}

export function getDigestPreference(db, user) {
  const row = db.prepare('SELECT * FROM digest_preferences WHERE user_id = ?').get(user.id)
  if (!row) return defaultPreference(user)
  return {
    enabled: Boolean(row.enabled),
    frequency: normalizeFrequency(row.frequency),
    recipient_email: row.recipient_email || user.email || '',
    last_sent_at: row.last_sent_at || null,
    next_send_at: row.next_send_at || null,
  }
}

export function saveDigestPreference(db, user, body = {}) {
  const frequency = normalizeFrequency(clean(body.frequency, 40))
  const enabled = body.enabled ? 1 : 0
  const recipientEmail = clean(body.recipient_email, 320) || user.email || ''
  const existing = db.prepare('SELECT * FROM digest_preferences WHERE user_id = ?').get(user.id)
  if (enabled && !isValidEmail(recipientEmail)) {
    const err = new Error('Add a valid recipient email before enabling overview emails.')
    err.status = 400
    throw err
  }
  const frequencyChanged = existing?.frequency && normalizeFrequency(existing.frequency) !== frequency
  const wasDisabled = !existing?.enabled
  const next = enabled ? (frequencyChanged || wasDisabled ? nextSendAt(frequency, new Date()) : (existing?.next_send_at || nextSendAt(frequency, new Date()))) : null

  db.prepare(`
    INSERT INTO digest_preferences (
      user_id,
      recipient_email,
      enabled,
      frequency,
      next_send_at,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET
      recipient_email = excluded.recipient_email,
      enabled = excluded.enabled,
      frequency = excluded.frequency,
      next_send_at = CASE
        WHEN excluded.enabled = 1 THEN excluded.next_send_at
        ELSE NULL
      END,
      updated_at = datetime('now')
  `).run(user.id, recipientEmail, enabled, frequency, next)

  return getDigestPreference(db, user)
}

function getStatusCounts(applications) {
  const statuses = ['Saved', 'Applied', 'Interview', 'Assessment', 'Offer', 'Rejected']
  const counts = Object.fromEntries(statuses.map(status => [status, 0]))
  for (const app of applications) {
    if (counts[app.status] !== undefined) counts[app.status] += 1
  }
  return counts
}

function buildReminders(applications, pendingEmailCount) {
  const reminders = []
  const active = applications.filter(app => !isTerminal(app.status))

  for (const app of active) {
    const deadlineDays = daysUntil(app.deadline_date)
    const appliedDays = daysBetween(app.date_applied || app.date_saved)
    if (deadlineDays !== null && deadlineDays < 0) {
      reminders.push({
        type: 'deadline',
        title: `${app.title} at ${app.company}`,
        copy: `Deadline passed on ${formatDate(app.deadline_date)}. Update the status or close the task.`,
      })
    } else if (deadlineDays !== null && deadlineDays <= 7) {
      reminders.push({
        type: 'deadline',
        title: `${app.title} at ${app.company}`,
        copy: `Deadline is ${deadlineDays === 0 ? 'today' : `in ${deadlineDays} day${deadlineDays === 1 ? '' : 's'}`}.`,
      })
    }
    if (app.status === 'Applied' && appliedDays !== null && appliedDays >= 10) {
      reminders.push({
        type: 'follow_up',
        title: `${app.title} at ${app.company}`,
        copy: `No recorded update for ${appliedDays} days. Consider a follow-up.`,
      })
    }
    if (app.status === 'Interview') {
      reminders.push({
        type: 'interview',
        title: `${app.title} at ${app.company}`,
        copy: 'Prepare interview examples and confirm the next date.',
      })
    }
    if (['Saved', 'Applied'].includes(app.status) && (!app.cv_review_json || !app.cover_letter_json)) {
      reminders.push({
        type: 'documents',
        title: `${app.title} at ${app.company}`,
        copy: 'Application material is incomplete. Review CV fit or cover letter.',
      })
    }
  }

  if (pendingEmailCount > 0) {
    reminders.unshift({
      type: 'email',
      title: 'Gmail application updates',
      copy: `${pendingEmailCount} email suggestion${pendingEmailCount === 1 ? '' : 's'} need review.`,
    })
  }

  return reminders.slice(0, 8)
}

function getNextBestAction(applications, reminders) {
  const interviewReminder = reminders.find(item => item.type === 'interview')
  if (interviewReminder) {
    return {
      title: `Prepare interview: ${interviewReminder.title}`,
      copy: 'Recommended because an application is in Interview status.',
    }
  }
  const deadlineReminder = reminders.find(item => item.type === 'deadline')
  if (deadlineReminder) {
    return {
      title: `Handle deadline: ${deadlineReminder.title}`,
      copy: deadlineReminder.copy,
    }
  }
  const followUpReminder = reminders.find(item => item.type === 'follow_up')
  if (followUpReminder) {
    return {
      title: `Follow up: ${followUpReminder.title}`,
      copy: followUpReminder.copy,
    }
  }
  const active = applications.find(app => !isTerminal(app.status))
  return active
    ? {
        title: `Update next step: ${active.title}`,
        copy: 'Recommended because this active application should have a clear next action.',
      }
    : {
        title: 'Save a strong-fit job',
        copy: 'Recommended because there are no active applications needing action.',
      }
}

export function buildDigest(db, userId) {
  const applications = db.prepare('SELECT * FROM tracker WHERE user_id = ? ORDER BY date_saved DESC').all(userId)
  const pendingEmail = db.prepare(`
    SELECT COUNT(*) as total
    FROM email_action_suggestions
    WHERE user_id = ? AND status = 'pending'
  `).get(userId)?.total || 0
  const counts = getStatusCounts(applications)
  const reminders = buildReminders(applications, pendingEmail)
  const nextBestAction = getNextBestAction(applications, reminders)
  const activeCount = applications.filter(app => !isTerminal(app.status)).length
  const subject = `ApplyWise overview: ${activeCount} active application${activeCount === 1 ? '' : 's'}`

  const statusRows = Object.entries(counts).map(([status, count]) => ({ status, count }))
  const applicationRows = applications.slice(0, 12).map(app => ({
    title: app.title,
    company: app.company,
    status: app.status,
    deadline: formatDate(app.deadline_date),
    next_action: reminders.find(item => item.title === `${app.title} at ${app.company}`)?.copy || 'No urgent action.',
  }))

  const text = [
    subject,
    '',
    `Next best action: ${nextBestAction.title}`,
    nextBestAction.copy,
    '',
    'Status overview:',
    ...statusRows.map(row => `- ${row.status}: ${row.count}`),
    '',
    'Reminders:',
    ...(reminders.length ? reminders.map(item => `- ${item.title}: ${item.copy}`) : ['- No urgent reminders.']),
    '',
    'Applications:',
    ...(applicationRows.length ? applicationRows.map(app => `- ${app.title} at ${app.company}: ${app.status}${app.deadline ? `, deadline ${app.deadline}` : ''}`) : ['- No applications saved yet.']),
    '',
    'You can change or disable this digest from ApplyWise Coach.',
  ].join('\n')

  const html = `
    <div style="font-family:Arial,sans-serif;color:#18181b;line-height:1.5">
      <h1 style="font-size:22px;margin:0 0 8px">Your ApplyWise overview</h1>
      <p style="margin:0 0 18px;color:#71717a">Private job-search summary from ApplyWise.</p>
      <div style="border:1px solid #d4d4d8;border-radius:8px;padding:14px;margin-bottom:16px">
        <p style="font-size:12px;text-transform:uppercase;font-weight:700;color:#71717a;margin:0 0 4px">Next best action</p>
        <h2 style="font-size:18px;margin:0 0 6px">${escapeHtml(nextBestAction.title)}</h2>
        <p style="margin:0;color:#52525b">${escapeHtml(nextBestAction.copy)}</p>
      </div>
      <h2 style="font-size:16px;margin:18px 0 8px">Status overview</h2>
      <table style="border-collapse:collapse;width:100%;margin-bottom:16px">
        <tbody>
          ${statusRows.map(row => `<tr><td style="border:1px solid #e4e4e7;padding:8px;font-weight:700">${escapeHtml(row.status)}</td><td style="border:1px solid #e4e4e7;padding:8px">${row.count}</td></tr>`).join('')}
        </tbody>
      </table>
      <h2 style="font-size:16px;margin:18px 0 8px">Reminders</h2>
      <ul>
        ${(reminders.length ? reminders : [{ title: 'No urgent reminders', copy: 'Nothing needs immediate action.' }]).map(item => `<li><strong>${escapeHtml(item.title)}</strong>: ${escapeHtml(item.copy)}</li>`).join('')}
      </ul>
      <h2 style="font-size:16px;margin:18px 0 8px">Applications</h2>
      <ul>
        ${(applicationRows.length ? applicationRows : [{ title: 'No applications saved', company: '', status: '', deadline: '' }]).map(app => `<li><strong>${escapeHtml(app.title)}${app.company ? ` at ${escapeHtml(app.company)}` : ''}</strong>: ${escapeHtml(app.status || 'Add applications in ApplyWise')}${app.deadline ? `, deadline ${escapeHtml(app.deadline)}` : ''}</li>`).join('')}
      </ul>
      <p style="font-size:12px;color:#71717a;margin-top:18px">You can change or disable this digest from ApplyWise Coach.</p>
    </div>
  `

  return {
    subject,
    text,
    html,
    summary: {
      active_applications: activeCount,
      total_applications: applications.length,
      pending_email_suggestions: pendingEmail,
      status_counts: counts,
      reminders,
      next_best_action: nextBestAction,
      applications: applicationRows,
    },
  }
}

function logDigest(db, { userId, recipientEmail, subject, status, errorMessage = '', providerMessageId = '' }) {
  db.prepare(`
    INSERT INTO digest_email_logs (
      user_id,
      recipient_email,
      subject,
      status,
      error_message,
      provider_message_id,
      sent_at
    ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(userId, recipientEmail, subject, status, errorMessage, providerMessageId)
}

export async function sendDigestNow(db, user, recipientEmail) {
  const digest = buildDigest(db, user.id)
  const to = clean(recipientEmail, 320) || user.email
  if (!to) {
    const err = new Error('Add a recipient email before sending a digest.')
    err.status = 400
    throw err
  }
  if (!isValidEmail(to)) {
    const err = new Error('Add a valid recipient email before sending a digest.')
    err.status = 400
    throw err
  }

  try {
    const sent = await sendEmail({ to, subject: digest.subject, html: digest.html, text: digest.text })
    logDigest(db, {
      userId: user.id,
      recipientEmail: to,
      subject: digest.subject,
      status: 'sent',
      providerMessageId: sent.id || '',
    })
    return { sent: true, provider_message_id: sent.id || null, digest }
  } catch (error) {
    logDigest(db, {
      userId: user.id,
      recipientEmail: to,
      subject: digest.subject,
      status: 'failed',
      errorMessage: error.message || 'Email send failed.',
    })
    throw error
  }
}

export async function runDueDigestJobs(db) {
  if (!isMailerConfigured()) return { sent: 0, skipped: 'mailer_not_configured' }
  const now = new Date().toISOString()
  const rows = db.prepare(`
    SELECT *
    FROM digest_preferences
    WHERE enabled = 1
      AND recipient_email IS NOT NULL
      AND recipient_email != ''
      AND next_send_at IS NOT NULL
      AND next_send_at <= ?
    LIMIT 25
  `).all(now)

  let sent = 0
  for (const row of rows) {
    try {
      await sendDigestNow(db, { id: row.user_id, email: row.recipient_email }, row.recipient_email)
      db.prepare(`
        UPDATE digest_preferences
        SET last_sent_at = ?, next_send_at = ?, updated_at = datetime('now')
        WHERE user_id = ?
      `).run(now, nextSendAt(row.frequency, new Date()), row.user_id)
      sent++
    } catch (error) {
      console.error('[digest] Send failed:', error.message)
      db.prepare(`
        UPDATE digest_preferences
        SET next_send_at = ?, updated_at = datetime('now')
        WHERE user_id = ?
      `).run(nextSendAt(row.frequency, new Date()), row.user_id)
    }
  }

  return { sent }
}
