import express from 'express'
import { getDb } from '../db/database.js'
import { requireAuth } from '../middleware/auth.js'
import { fetchAdzunaJobs, resolveAdzunaUrls } from '../services/adzuna.js'

const router = express.Router()

const DAY_MAP = { '24h': 1, '7days': 7, '30days': 30 }

// GET /api/jobs — list jobs with filters
router.get('/', (req, res) => {
  try {
    const db = getDb()
    const { locations, sectors, days, q } = req.query

    let query = 'SELECT * FROM jobs WHERE created_by IS NULL'
    const params = []
    if (req.user?.id) {
      query = 'SELECT * FROM jobs WHERE (created_by IS NULL OR created_by = ?)'
      params.push(req.user.id)
    }

    if (locations) {
      const locs = locations.split(',').map(l => l.trim()).filter(Boolean)
      if (locs.length > 0) {
        query += ` AND (${locs.map(() => 'LOWER(location) LIKE ?').join(' OR ')})`
        locs.forEach(l => params.push(`%${l.toLowerCase()}%`))
      }
    }

    if (sectors) {
      const secs = sectors.split(',').map(s => s.trim()).filter(Boolean)
      if (secs.length > 0) {
        query += ` AND (${secs.map(() => 'LOWER(sector) LIKE ?').join(' OR ')})`
        secs.forEach(s => params.push(`%${s.toLowerCase()}%`))
      }
    }

    const daysNum = DAY_MAP[days]
    if (daysNum) {
      // Compute cutoff in JS so both sides are the same ISO-8601 format —
      // avoids SQLite datetime() quirks with the trailing 'Z' in stored dates.
      const cutoff = new Date(Date.now() - daysNum * 86_400_000).toISOString()
      query += ' AND date_posted >= ?'
      params.push(cutoff)
    }

    if (q) {
      query += ' AND (LOWER(title) LIKE ? OR LOWER(company) LIKE ? OR LOWER(description) LIKE ?)'
      const term = `%${q.toLowerCase()}%`
      params.push(term, term, term)
    }

    query += ' ORDER BY date_posted DESC LIMIT 500'

    const jobs = db.prepare(query).all(...params)
    res.json(jobs)
  } catch (err) {
    console.error('[jobs] GET error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/jobs/refresh — fetch fresh jobs from Adzuna
router.post('/refresh', requireAuth, async (req, res) => {
  if (!process.env.ADZUNA_APP_ID || !process.env.ADZUNA_APP_KEY) {
    return res.status(400).json({
      error: 'Adzuna API keys not configured. Add ADZUNA_APP_ID and ADZUNA_APP_KEY to server/.env',
    })
  }

  try {
    const { upserted, errors } = await fetchAdzunaJobs()
    // Respond immediately; resolve redirect URLs in background
    res.json({ success: true, upserted, searchErrors: errors.length })
    resolveAdzunaUrls().catch(err => console.error('[resolve] Error:', err.message))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
