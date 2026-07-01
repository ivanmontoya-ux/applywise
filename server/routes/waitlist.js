import express from 'express'
import { getDb } from '../db/database.js'

const router = express.Router()

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function clean(value, max = 500) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

router.get('/stats', (_req, res) => {
  const db = getDb()
  const stats = db.prepare(`
    SELECT
      COUNT(*) as total,
      MAX(created_at) as latest_signup_at
    FROM waitlist_signups
  `).get()

  const topRoles = db.prepare(`
    SELECT target_role, COUNT(*) as total
    FROM waitlist_signups
    WHERE target_role IS NOT NULL AND target_role != ''
    GROUP BY target_role
    ORDER BY total DESC, target_role ASC
    LIMIT 3
  `).all()

  res.json({
    total: stats?.total || 0,
    latest_signup_at: stats?.latest_signup_at || null,
    top_roles: topRoles,
  })
})

router.post('/', (req, res) => {
  const db = getDb()
  const email = clean(req.body.email, 320).toLowerCase()
  const fullName = clean(req.body.full_name || req.body.fullName, 160)
  const location = clean(req.body.location, 160)
  const targetRole = clean(req.body.target_role || req.body.targetRole, 160)
  const strongestNeed = clean(req.body.strongest_need || req.body.strongestNeed, 800)
  const source = clean(req.body.source, 80) || 'web_app'
  const consent = req.body.consent === true || req.body.consent === 1 || req.body.consent === 'true'

  if (!email || !emailPattern.test(email)) {
    return res.status(400).json({ error: 'Add a valid email to join the waitlist.' })
  }

  if (!consent) {
    return res.status(400).json({ error: 'Confirm consent before joining the waitlist.' })
  }

  const existing = db.prepare('SELECT id, created_at FROM waitlist_signups WHERE email = ?').get(email)
  if (existing) {
    return res.json({
      id: existing.id,
      existing: true,
      message: 'This email is already on the waitlist.',
    })
  }

  const result = db.prepare(`
    INSERT INTO waitlist_signups (
      email,
      full_name,
      location,
      target_role,
      strongest_need,
      source,
      consent
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    email,
    fullName || null,
    location || null,
    targetRole || null,
    strongestNeed || null,
    source,
    consent ? 1 : 0,
  )

  res.status(201).json({
    id: result.lastInsertRowid,
    created: true,
    message: 'You are on the waitlist.',
  })
})

export default router
