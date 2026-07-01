import express from 'express'
import { getDb } from '../db/database.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()
const APPLICATION_STATUSES = new Set(['Saved', 'Applied', 'Interview', 'Assessment', 'Offer', 'Rejected', 'Withdrawn'])

// GET /api/tracker
router.get('/', (req, res) => {
  if (!req.user?.id) return res.json([])

  const db = getDb()
  const { status } = req.query
  let query = 'SELECT * FROM tracker WHERE user_id = ?'
  const params = [req.user.id]
  if (status && status !== 'all') {
    query += ' AND status = ?'
    params.push(status)
  }
  query += ' ORDER BY date_saved DESC'
  res.json(db.prepare(query).all(...params))
})

// POST /api/tracker — save a job
router.post('/', requireAuth, (req, res) => {
  const db = getDb()
  const userId = req.user.id
  const { job_id, title, company, location, url, sector, deadline_type, deadline_date, notes } = req.body

  if (url) {
    const existing = db.prepare('SELECT id FROM tracker WHERE user_id = ? AND url = ?').get(userId, url)
    if (existing) return res.json({ id: existing.id, existing: true })
  }
  if (job_id) {
    const existing = db.prepare('SELECT id FROM tracker WHERE user_id = ? AND job_id = ?').get(userId, job_id)
    if (existing) return res.json({ id: existing.id, existing: true })
  }

  const result = db.prepare(`
    INSERT INTO tracker (user_id, job_id, title, company, location, url, sector, deadline_type, deadline_date, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    userId,
    job_id || null, title, company,
    location || '', url || '', sector || '',
    deadline_type || null, deadline_date || null,
    notes || null
  )
  res.json({ id: result.lastInsertRowid })
})

// PATCH /api/tracker/:id — update status, notes, date_applied
router.patch('/:id', requireAuth, (req, res) => {
  const db = getDb()
  const userId = req.user.id
  const { status, notes, date_applied } = req.body
  const fields = []
  const values = []
  if (status !== undefined) {
    if (!APPLICATION_STATUSES.has(status)) return res.status(400).json({ error: 'Unsupported application status' })
    fields.push('status = ?'); values.push(status)
  }
  if (notes !== undefined) { fields.push('notes = ?'); values.push(notes) }
  if (date_applied !== undefined) { fields.push('date_applied = ?'); values.push(date_applied) }
  if (fields.length === 0) return res.status(400).json({ error: 'Nothing to update' })
  values.push(req.params.id, userId)
  const result = db.prepare(`UPDATE tracker SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`).run(...values)
  if (result.changes === 0) return res.status(404).json({ error: 'Application not found.' })
  res.json({ success: true })
})

// DELETE /api/tracker/:id
router.delete('/:id', requireAuth, (req, res) => {
  const db = getDb()
  db.prepare('DELETE FROM tracker WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id)
  res.json({ success: true })
})

export default router
