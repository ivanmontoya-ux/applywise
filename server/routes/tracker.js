import express from 'express'
import { getDb } from '../db/database.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()
const APPLICATION_STATUSES = new Set(['Saved', 'Applied', 'Interview', 'Assessment', 'Offer', 'Rejected'])
const DOCUMENT_READINESS = new Set(['Missing', 'CV reviewed', 'Cover letter ready', 'Complete'])

function parseJsonField(value) {
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function stringifyJsonField(value, fieldName) {
  if (value === null) return null
  if (value === undefined) return undefined

  try {
    return JSON.stringify(value)
  } catch {
    const err = new Error(`${fieldName} must be valid JSON.`)
    err.status = 400
    throw err
  }
}

function serializeApplication(row) {
  if (!row) return row
  return {
    ...row,
    cv_review: parseJsonField(row.cv_review_json),
    cover_letter: parseJsonField(row.cover_letter_json),
  }
}

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
  res.json(db.prepare(query).all(...params).map(serializeApplication))
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

// GET /api/tracker/:id — fetch one tracked application
router.get('/:id', requireAuth, (req, res) => {
  const db = getDb()
  const application = db.prepare('SELECT * FROM tracker WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id)
  if (!application) return res.status(404).json({ error: 'Application not found.' })
  res.json(serializeApplication(application))
})

// PATCH /api/tracker/:id — update status, notes, date_applied, or saved AI document material
router.patch('/:id', requireAuth, (req, res) => {
  try {
    const db = getDb()
    const userId = req.user.id
    const { status, notes, date_applied, deadline_type, deadline_date, document_readiness, cv_review, cover_letter } = req.body
    const fields = []
    const values = []
    let touchedDocuments = false

    if (status !== undefined) {
      if (!APPLICATION_STATUSES.has(status)) return res.status(400).json({ error: 'Unsupported application status' })
      fields.push('status = ?'); values.push(status)
    }
    if (notes !== undefined) { fields.push('notes = ?'); values.push(notes) }
    if (date_applied !== undefined) { fields.push('date_applied = ?'); values.push(date_applied) }
    if (deadline_type !== undefined) { fields.push('deadline_type = ?'); values.push(deadline_type || null) }
    if (deadline_date !== undefined) { fields.push('deadline_date = ?'); values.push(deadline_date || null) }
    if (document_readiness !== undefined) {
      if (!DOCUMENT_READINESS.has(document_readiness)) return res.status(400).json({ error: 'Unsupported document readiness value' })
      fields.push('document_readiness = ?'); values.push(document_readiness)
      touchedDocuments = true
    }
    if (cv_review !== undefined) {
      fields.push('cv_review_json = ?'); values.push(stringifyJsonField(cv_review, 'cv_review'))
      touchedDocuments = true
    }
    if (cover_letter !== undefined) {
      fields.push('cover_letter_json = ?'); values.push(stringifyJsonField(cover_letter, 'cover_letter'))
      touchedDocuments = true
    }
    if (touchedDocuments) {
      fields.push("documents_updated_at = datetime('now')")
    }
    if (fields.length === 0) return res.status(400).json({ error: 'Nothing to update' })

    values.push(req.params.id, userId)
    const result = db.prepare(`UPDATE tracker SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`).run(...values)
    if (result.changes === 0) return res.status(404).json({ error: 'Application not found.' })

    const updated = db.prepare('SELECT * FROM tracker WHERE id = ? AND user_id = ?').get(req.params.id, userId)
    res.json(serializeApplication(updated))
  } catch (err) {
    const status = err.status && Number.isInteger(err.status) ? err.status : 500
    res.status(status).json({ error: err.message || 'Application update failed.' })
  }
})

// DELETE /api/tracker/:id
router.delete('/:id', requireAuth, (req, res) => {
  const db = getDb()
  db.prepare('DELETE FROM tracker WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id)
  res.json({ success: true })
})

export default router
