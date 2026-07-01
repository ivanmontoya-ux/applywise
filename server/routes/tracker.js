import express from 'express'
import { getDb } from '../db/database.js'

const router = express.Router()
const APPLICATION_STATUSES = new Set(['Saved', 'Applied', 'Interview', 'Assessment', 'Offer', 'Rejected', 'Withdrawn'])

// GET /api/tracker
router.get('/', (req, res) => {
  const db = getDb()
  const { status } = req.query
  let query = 'SELECT * FROM tracker'
  const params = []
  if (status && status !== 'all') {
    query += ' WHERE status = ?'
    params.push(status)
  }
  query += ' ORDER BY date_saved DESC'
  res.json(db.prepare(query).all(...params))
})

// POST /api/tracker — save a job
router.post('/', (req, res) => {
  const db = getDb()
  const { job_id, title, company, location, url, sector, deadline_type, deadline_date, notes } = req.body

  if (url) {
    const existing = db.prepare('SELECT id FROM tracker WHERE url = ?').get(url)
    if (existing) return res.json({ id: existing.id, existing: true })
  }
  if (job_id) {
    const existing = db.prepare('SELECT id FROM tracker WHERE job_id = ?').get(job_id)
    if (existing) return res.json({ id: existing.id, existing: true })
  }

  const result = db.prepare(`
    INSERT INTO tracker (job_id, title, company, location, url, sector, deadline_type, deadline_date, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    job_id || null, title, company,
    location || '', url || '', sector || '',
    deadline_type || null, deadline_date || null,
    notes || null
  )
  res.json({ id: result.lastInsertRowid })
})

// PATCH /api/tracker/:id — update status, notes, date_applied
router.patch('/:id', (req, res) => {
  const db = getDb()
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
  values.push(req.params.id)
  db.prepare(`UPDATE tracker SET ${fields.join(', ')} WHERE id = ?`).run(...values)
  res.json({ success: true })
})

// DELETE /api/tracker/:id
router.delete('/:id', (req, res) => {
  const db = getDb()
  db.prepare('DELETE FROM tracker WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

export default router
