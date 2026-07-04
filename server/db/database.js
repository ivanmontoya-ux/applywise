import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import { classifyJob, inferExperienceLevel, inferSector, isExcluded } from '../services/classifier.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, 'jobs.db')

let db

function createPersonalInformationTable() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS personal_information (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL UNIQUE,
      candidate_name TEXT,
      headline TEXT,
      summary TEXT,
      contact_json TEXT DEFAULT '{}',
      education_json TEXT DEFAULT '[]',
      experience_json TEXT DEFAULT '[]',
      projects_json TEXT DEFAULT '[]',
      skills_json TEXT DEFAULT '{}',
      certifications_json TEXT DEFAULT '[]',
      evidence_points_json TEXT DEFAULT '[]',
      missing_fields_json TEXT DEFAULT '[]',
      extraction_notes_json TEXT DEFAULT '[]',
      source TEXT DEFAULT 'cv_extraction',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS gmail_connections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL UNIQUE,
      gmail_email TEXT,
      refresh_token_encrypted TEXT,
      scope TEXT,
      token_type TEXT,
      last_history_id TEXT,
      connected_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      disconnected_at TEXT
    );

    CREATE TABLE IF NOT EXISTS email_import_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      gmail_message_id TEXT NOT NULL,
      thread_id TEXT,
      direction TEXT DEFAULT 'inbound',
      sender_name TEXT,
      sender_email TEXT,
      recipient_emails TEXT DEFAULT '[]',
      from_email TEXT,
      subject TEXT,
      received_at TEXT,
      snippet TEXT,
      detected_type TEXT,
      company TEXT,
      job_title TEXT,
      application_status TEXT,
      action_required TEXT,
      deadline_or_event_date TEXT,
      gmail_url TEXT,
      confidence REAL DEFAULT 0,
      detection_reasons_json TEXT DEFAULT '[]',
      matched_application_id INTEGER,
      raw_preview TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, gmail_message_id)
    );

    CREATE TABLE IF NOT EXISTS email_action_suggestions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      application_id INTEGER,
      email_import_event_id INTEGER NOT NULL,
      suggested_action TEXT NOT NULL,
      suggested_status TEXT,
      suggested_company TEXT,
      suggested_role TEXT,
      suggested_action_required TEXT,
      suggested_title TEXT,
      suggested_body TEXT,
      suggested_reminder_date TEXT,
      confidence REAL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(email_import_event_id) REFERENCES email_import_events(id)
    );
  `)
}

function ensurePersonalInformationSchema() {
  const row = db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'personal_information'").get()
  if (!row?.sql || !row.sql.includes('CHECK (id = 1)')) return

  db.exec(`
    ALTER TABLE personal_information RENAME TO personal_information_legacy;
  `)
  createPersonalInformationTable()
  db.exec(`
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
      source,
      created_at,
      updated_at
    )
    SELECT
      'legacy',
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
      source,
      created_at,
      updated_at
    FROM personal_information_legacy
    WHERE id = 1;

    DROP TABLE personal_information_legacy;
  `)
}

export function initDb() {
  db = new Database(DB_PATH)

  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      company_logo TEXT,
      location TEXT,
      sector TEXT,
      salary_min REAL,
      salary_max REAL,
      salary_currency TEXT,
      description TEXT,
      url TEXT NOT NULL,
      date_posted TEXT,
      source TEXT DEFAULT 'adzuna',
      created_at TEXT DEFAULT (datetime('now')),
      expires_at TEXT,
      created_by TEXT
    );

    CREATE TABLE IF NOT EXISTS tracker (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL DEFAULT 'legacy',
      job_id TEXT,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT,
      url TEXT,
      sector TEXT,
      date_saved TEXT DEFAULT (datetime('now')),
      date_applied TEXT,
      status TEXT DEFAULT 'Saved',
      notes TEXT,
      is_manual INTEGER DEFAULT 0,
      document_readiness TEXT DEFAULT 'Missing',
      cv_review_json TEXT,
      cover_letter_json TEXT,
      documents_updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS waitlist_signups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT,
      location TEXT,
      target_role TEXT,
      strongest_need TEXT,
      source TEXT DEFAULT 'web_app',
      consent INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS personal_information (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL UNIQUE,
      candidate_name TEXT,
      headline TEXT,
      summary TEXT,
      contact_json TEXT DEFAULT '{}',
      education_json TEXT DEFAULT '[]',
      experience_json TEXT DEFAULT '[]',
      projects_json TEXT DEFAULT '[]',
      skills_json TEXT DEFAULT '{}',
      certifications_json TEXT DEFAULT '[]',
      evidence_points_json TEXT DEFAULT '[]',
      missing_fields_json TEXT DEFAULT '[]',
      extraction_notes_json TEXT DEFAULT '[]',
      source TEXT DEFAULT 'cv_extraction',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `)

  createPersonalInformationTable()

  // Migrations — add new columns without destroying existing data
  const migrate = (table, col, type) => {
    try { db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`) } catch (_) {}
  }
  ensurePersonalInformationSchema()
  migrate('jobs',    'deadline_type',  'TEXT')
  migrate('jobs',    'deadline_date',  'TEXT')
  migrate('jobs',    'grand_category', 'TEXT')
  migrate('jobs',    'sub_type',       'TEXT')
  migrate('jobs',    'created_by',      'TEXT')
  migrate('tracker', 'user_id',         "TEXT NOT NULL DEFAULT 'legacy'")
  migrate('tracker', 'deadline_type',  'TEXT')
  migrate('tracker', 'deadline_date',  'TEXT')
  migrate('tracker', 'document_readiness', "TEXT DEFAULT 'Missing'")
  migrate('tracker', 'cv_review_json', 'TEXT')
  migrate('tracker', 'cover_letter_json', 'TEXT')
  migrate('tracker', 'documents_updated_at', 'TEXT')
  migrate('jobs', 'experience_level', 'TEXT')
  migrate('waitlist_signups', 'full_name', 'TEXT')
  migrate('waitlist_signups', 'location', 'TEXT')
  migrate('waitlist_signups', 'target_role', 'TEXT')
  migrate('waitlist_signups', 'strongest_need', 'TEXT')
  migrate('waitlist_signups', 'source', "TEXT DEFAULT 'web_app'")
  migrate('waitlist_signups', 'consent', 'INTEGER DEFAULT 1')
  migrate('personal_information', 'user_id', 'TEXT')
  migrate('personal_information', 'candidate_name', 'TEXT')
  migrate('personal_information', 'headline', 'TEXT')
  migrate('personal_information', 'summary', 'TEXT')
  migrate('personal_information', 'contact_json', "TEXT DEFAULT '{}'")
  migrate('personal_information', 'education_json', "TEXT DEFAULT '[]'")
  migrate('personal_information', 'experience_json', "TEXT DEFAULT '[]'")
  migrate('personal_information', 'projects_json', "TEXT DEFAULT '[]'")
  migrate('personal_information', 'skills_json', "TEXT DEFAULT '{}'")
  migrate('personal_information', 'certifications_json', "TEXT DEFAULT '[]'")
  migrate('personal_information', 'evidence_points_json', "TEXT DEFAULT '[]'")
  migrate('personal_information', 'missing_fields_json', "TEXT DEFAULT '[]'")
  migrate('personal_information', 'extraction_notes_json', "TEXT DEFAULT '[]'")
  migrate('personal_information', 'source', "TEXT DEFAULT 'cv_extraction'")
  migrate('personal_information', 'updated_at', 'TEXT')
  migrate('gmail_connections', 'gmail_email', 'TEXT')
  migrate('gmail_connections', 'refresh_token_encrypted', 'TEXT')
  migrate('gmail_connections', 'scope', 'TEXT')
  migrate('gmail_connections', 'token_type', 'TEXT')
  migrate('gmail_connections', 'last_history_id', 'TEXT')
  migrate('gmail_connections', 'updated_at', 'TEXT')
  migrate('gmail_connections', 'disconnected_at', 'TEXT')
  migrate('email_import_events', 'direction', "TEXT DEFAULT 'inbound'")
  migrate('email_import_events', 'sender_name', 'TEXT')
  migrate('email_import_events', 'sender_email', 'TEXT')
  migrate('email_import_events', 'recipient_emails', "TEXT DEFAULT '[]'")
  migrate('email_import_events', 'raw_preview', 'TEXT')
  migrate('email_import_events', 'application_status', 'TEXT')
  migrate('email_import_events', 'action_required', 'TEXT')
  migrate('email_import_events', 'deadline_or_event_date', 'TEXT')
  migrate('email_import_events', 'gmail_url', 'TEXT')
  migrate('email_import_events', 'confidence', 'REAL DEFAULT 0')
  migrate('email_import_events', 'detection_reasons_json', "TEXT DEFAULT '[]'")
  migrate('email_import_events', 'matched_application_id', 'INTEGER')
  migrate('email_action_suggestions', 'suggested_company', 'TEXT')
  migrate('email_action_suggestions', 'suggested_role', 'TEXT')
  migrate('email_action_suggestions', 'suggested_action_required', 'TEXT')
  migrate('email_action_suggestions', 'suggested_reminder_date', 'TEXT')

  db.exec(`
    CREATE INDEX IF NOT EXISTS jobs_created_by_idx ON jobs(created_by);
    CREATE INDEX IF NOT EXISTS tracker_user_status_idx ON tracker(user_id, status, date_saved DESC);
    CREATE INDEX IF NOT EXISTS tracker_user_job_idx ON tracker(user_id, job_id);
    CREATE INDEX IF NOT EXISTS tracker_user_url_idx ON tracker(user_id, url);
    CREATE UNIQUE INDEX IF NOT EXISTS personal_information_user_unique_idx ON personal_information(user_id);
    CREATE UNIQUE INDEX IF NOT EXISTS gmail_connections_user_unique_idx ON gmail_connections(user_id);
    CREATE INDEX IF NOT EXISTS email_import_events_user_type_idx ON email_import_events(user_id, detected_type, received_at DESC);
    CREATE UNIQUE INDEX IF NOT EXISTS email_import_events_user_message_idx ON email_import_events(user_id, gmail_message_id);
    CREATE INDEX IF NOT EXISTS email_import_events_user_direction_idx ON email_import_events(user_id, direction, received_at DESC);
    CREATE INDEX IF NOT EXISTS email_import_events_user_match_idx ON email_import_events(user_id, matched_application_id);
    CREATE INDEX IF NOT EXISTS email_action_suggestions_user_status_idx ON email_action_suggestions(user_id, status, created_at DESC);
  `)

  db.prepare("UPDATE tracker SET status = 'Interview' WHERE status IN ('Phone Screen', 'Final Round')").run()
  db.prepare("UPDATE tracker SET status = 'Withdrawn' WHERE status IN ('Declined', 'Archived')").run()
  db.prepare("UPDATE tracker SET status = 'Saved' WHERE status IS NULL OR status = ''").run()

  // Back-fill and refresh classification for jobs that predate current categories.
  const jobsForClassification = db.prepare('SELECT id, title, grand_category, sub_type FROM jobs WHERE created_by IS NULL').all()
  if (jobsForClassification.length > 0) {
    const update = db.prepare('UPDATE jobs SET grand_category = ?, sub_type = ? WHERE id = ?')
    let changed = 0
    for (const { id, title, grand_category, sub_type } of jobsForClassification) {
      const { grandCategory, subType } = classifyJob(title)
      if (grandCategory !== grand_category || subType !== sub_type) {
        update.run(grandCategory, subType, id)
        changed++
      }
    }
    if (changed > 0) console.log(`Classified ${changed} existing jobs`)
  }

  const unleveled = db.prepare("SELECT id, title, description FROM jobs WHERE experience_level IS NULL").all()
  if (unleveled.length > 0) {
    const setLevel = db.prepare('UPDATE jobs SET experience_level = ? WHERE id = ?')
    for (const { id, title, description } of unleveled) {
      const level = inferExperienceLevel(title, description || '')
      if (level) setLevel.run(level, id)
    }
    console.log(`Set experience level for ${unleveled.length} existing jobs`)
  }

  const jobsForSector = db.prepare('SELECT id, title, description, sector FROM jobs WHERE created_by IS NULL').all()
  if (jobsForSector.length > 0) {
    const updateSector = db.prepare('UPDATE jobs SET sector = ? WHERE id = ?')
    let changed = 0
    for (const { id, title, description, sector } of jobsForSector) {
      const inferred = inferSector(title, description || '')
      if (inferred && inferred !== sector) {
        updateSector.run(inferred, id)
        changed++
      }
    }
    if (changed > 0) console.log(`Reclassified ${changed} job sectors`)
  }

  const adzunaJobs = db.prepare("SELECT id, title, description FROM jobs WHERE source = 'adzuna' AND created_by IS NULL").all()
  if (adzunaJobs.length > 0) {
    const deleteJob = db.prepare('DELETE FROM jobs WHERE id = ?')
    let removed = 0
    for (const { id, title, description } of adzunaJobs) {
      if (isExcluded(title, description || '')) {
        deleteJob.run(id)
        removed++
      }
    }
    if (removed > 0) console.log(`Removed ${removed} off-target Adzuna jobs`)
  }

  console.log('Database initialized')
  return db
}

export function getDb() {
  return db
}
