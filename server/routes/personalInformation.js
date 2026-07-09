import express from 'express'
import { getDb } from '../db/database.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

function clean(value, max = 2000) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

function asArray(value) {
  return Array.isArray(value) ? value : []
}

function cleanArray(value, limit = 30) {
  return asArray(value)
    .map(item => (typeof item === 'string' ? clean(item, 1000) : ''))
    .filter(Boolean)
    .slice(0, limit)
}

function safeJsonParse(value, fallback) {
  if (!value) return fallback
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

function stringify(value) {
  return JSON.stringify(value ?? null)
}

function normalizeProfile(raw = {}) {
  const contact = raw.contact && typeof raw.contact === 'object' ? raw.contact : {}
  const skills = raw.skills && typeof raw.skills === 'object' ? raw.skills : {}

  return {
    candidate_name: clean(raw.candidate_name, 200),
    headline: clean(raw.headline, 300),
    summary: clean(raw.summary, 4000),
    contact: {
      email: clean(contact.email, 320),
      phone: clean(contact.phone, 80),
      location: clean(contact.location, 200),
      linkedin: clean(contact.linkedin, 500),
      portfolio: clean(contact.portfolio, 500),
    },
    education: asArray(raw.education).slice(0, 20),
    experience: asArray(raw.experience).slice(0, 30),
    projects: asArray(raw.projects).slice(0, 20),
    skills: {
      technical: cleanArray(skills.technical),
      business: cleanArray(skills.business),
      tools: cleanArray(skills.tools),
      languages: cleanArray(skills.languages),
      other: cleanArray(skills.other),
    },
    certifications: asArray(raw.certifications).slice(0, 20),
    evidence_points: asArray(raw.evidence_points).slice(0, 30),
    missing_fields: cleanArray(raw.missing_fields, 30),
    extraction_notes: cleanArray(raw.extraction_notes, 20),
  }
}

function rowToProfile(row) {
  if (!row) return null

  return {
    candidate_name: row.candidate_name || '',
    headline: row.headline || '',
    summary: row.summary || '',
    contact: safeJsonParse(row.contact_json, {}),
    education: safeJsonParse(row.education_json, []),
    experience: safeJsonParse(row.experience_json, []),
    projects: safeJsonParse(row.projects_json, []),
    skills: safeJsonParse(row.skills_json, {}),
    certifications: safeJsonParse(row.certifications_json, []),
    evidence_points: safeJsonParse(row.evidence_points_json, []),
    missing_fields: safeJsonParse(row.missing_fields_json, []),
    extraction_notes: safeJsonParse(row.extraction_notes_json, []),
    source: row.source || 'cv_extraction',
    created_at: row.created_at || null,
    updated_at: row.updated_at || null,
  }
}

router.get('/', (_req, res) => {
  if (!_req.user?.id) {
    return res.json({
      exists: false,
      profile: null,
    })
  }

  const db = getDb()
  const row = db.prepare('SELECT * FROM personal_information WHERE user_id = ?').get(_req.user.id)
  res.json({
    exists: Boolean(row),
    profile: rowToProfile(row),
  })
})

router.put('/', requireAuth, (req, res) => {
  try {
    const db = getDb()
    const userId = req.user.id
    const profile = normalizeProfile(req.body.profile || req.body)
    const source = clean(req.body.source, 80) || 'cv_extraction'

    db.prepare(`
      INSERT INTO personal_information (
        user_id,
        candidate_name,
        headline,
        summary,
        contact_json,
        education_json,
        experience_json,
        projects_json,
        skills_json,
        certifications_json,
        evidence_points_json,
        missing_fields_json,
        extraction_notes_json,
        source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        candidate_name = excluded.candidate_name,
        headline = excluded.headline,
        summary = excluded.summary,
        contact_json = excluded.contact_json,
        education_json = excluded.education_json,
        experience_json = excluded.experience_json,
        projects_json = excluded.projects_json,
        skills_json = excluded.skills_json,
        certifications_json = excluded.certifications_json,
        evidence_points_json = excluded.evidence_points_json,
        missing_fields_json = excluded.missing_fields_json,
        extraction_notes_json = excluded.extraction_notes_json,
        source = excluded.source,
        updated_at = datetime('now')
    `).run(
      userId,
      profile.candidate_name || null,
      profile.headline || null,
      profile.summary || null,
      stringify(profile.contact),
      stringify(profile.education),
      stringify(profile.experience),
      stringify(profile.projects),
      stringify(profile.skills),
      stringify(profile.certifications),
      stringify(profile.evidence_points),
      stringify(profile.missing_fields),
      stringify(profile.extraction_notes),
      source,
    )

    const row = db.prepare('SELECT * FROM personal_information WHERE user_id = ?').get(userId)
    res.json({
      saved: true,
      profile: rowToProfile(row),
    })
  } catch (error) {
    console.error('[personal-information] Save failed:', error)
    res.status(500).json({ error: error.message || 'Personal information could not be saved.' })
  }
})

router.delete('/', requireAuth, (_req, res) => {
  const db = getDb()
  db.prepare('DELETE FROM personal_information WHERE user_id = ?').run(_req.user.id)
  res.json({ success: true })
})

export default router
