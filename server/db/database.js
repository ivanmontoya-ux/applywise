import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import { classifyJob, inferExperienceLevel } from '../services/classifier.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, 'jobs.db')

let db

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
      expires_at TEXT
    );

    CREATE TABLE IF NOT EXISTS tracker (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      is_manual INTEGER DEFAULT 0
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
  `)

  // Migrations — add new columns without destroying existing data
  const migrate = (table, col, type) => {
    try { db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`) } catch (_) {}
  }
  migrate('jobs',    'deadline_type',  'TEXT')
  migrate('jobs',    'deadline_date',  'TEXT')
  migrate('jobs',    'grand_category', 'TEXT')
  migrate('jobs',    'sub_type',       'TEXT')
  migrate('tracker', 'deadline_type',  'TEXT')
  migrate('tracker', 'deadline_date',  'TEXT')
  migrate('jobs', 'experience_level', 'TEXT')
  migrate('waitlist_signups', 'full_name', 'TEXT')
  migrate('waitlist_signups', 'location', 'TEXT')
  migrate('waitlist_signups', 'target_role', 'TEXT')
  migrate('waitlist_signups', 'strongest_need', 'TEXT')
  migrate('waitlist_signups', 'source', "TEXT DEFAULT 'web_app'")
  migrate('waitlist_signups', 'consent', 'INTEGER DEFAULT 1')

  db.prepare("UPDATE tracker SET status = 'Interview' WHERE status IN ('Phone Screen', 'Final Round')").run()
  db.prepare("UPDATE tracker SET status = 'Withdrawn' WHERE status IN ('Declined', 'Archived')").run()
  db.prepare("UPDATE tracker SET status = 'Saved' WHERE status IS NULL OR status = ''").run()

  // Back-fill classification for any jobs that predate this migration
  const unclassified = db.prepare('SELECT id, title FROM jobs WHERE grand_category IS NULL').all()
  if (unclassified.length > 0) {
    const update = db.prepare('UPDATE jobs SET grand_category = ?, sub_type = ? WHERE id = ?')
    for (const { id, title } of unclassified) {
      const { grandCategory, subType } = classifyJob(title)
      update.run(grandCategory, subType, id)
    }
    console.log(`Classified ${unclassified.length} existing jobs`)
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

  console.log('Database initialized')
  return db
}

export function getDb() {
  return db
}
