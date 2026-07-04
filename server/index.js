import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cron from 'node-cron'
import path from 'path'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { initDb, getDb } from './db/database.js'
import jobsRouter from './routes/jobs.js'
import trackerRouter from './routes/tracker.js'
import aiRouter from './routes/ai.js'
import waitlistRouter from './routes/waitlist.js'
import personalInformationRouter from './routes/personalInformation.js'
import gmailRouter from './routes/gmail.js'
import digestRouter from './routes/digest.js'
import { optionalAuth } from './middleware/auth.js'
import { fetchAdzunaJobs, resolveAdzunaUrls } from './services/adzuna.js'
import { runDueDigestJobs } from './services/digest.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientDistPath = path.resolve(__dirname, '../client/dist')
const app = express()
const PORT = process.env.PORT || 3001
const HOST = process.env.HOST || '127.0.0.1'

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json({ limit: '8mb' }))

initDb()

// On startup: fetch from Adzuna if the jobs table is empty and keys are present
async function initialFetch() {
  if (!process.env.ADZUNA_APP_ID || !process.env.ADZUNA_APP_KEY) return

  const db = getDb()
  const { count } = db.prepare('SELECT COUNT(*) as count FROM jobs').get()

  if (count === 0) {
    console.log('[startup] Jobs table empty — fetching from Adzuna…')
    try {
      const { upserted } = await fetchAdzunaJobs()
      console.log(`[startup] Fetched ${upserted} jobs from Adzuna`)
      resolveAdzunaUrls().catch(err => console.error('[resolve] Error:', err.message))
    } catch (err) {
      console.error('[startup] Adzuna fetch failed, falling back to seed data:', err.message)
      try {
        const { seedDb } = await import('./db/seed.js')
        seedDb(getDb())
        console.log('[startup] Seed data loaded')
      } catch (seedErr) {
        console.error('[startup] Seed also failed:', seedErr.message)
      }
    }
  } else {
    console.log(`[startup] ${count} jobs already in DB — skipping initial fetch`)
    // Resolve any leftover Adzuna redirect URLs from previous imports
    resolveAdzunaUrls().catch(err => console.error('[resolve] Error:', err.message))
  }
}

initialFetch()

app.use('/api/waitlist', waitlistRouter)
app.use('/api/jobs', optionalAuth, jobsRouter)
app.use('/api/tracker', optionalAuth, trackerRouter)
app.use('/api/ai', optionalAuth, aiRouter)
app.use('/api/personal-information', optionalAuth, personalInformationRouter)
app.use('/api/integrations/gmail', optionalAuth, gmailRouter)
app.use('/api/digest', optionalAuth, digestRouter)

if (existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    res.sendFile(path.join(clientDistPath, 'index.html'))
  })
}

// Auto-refresh daily at 6am
cron.schedule('0 6 * * *', async () => {
  if (!process.env.ADZUNA_APP_ID || !process.env.ADZUNA_APP_KEY) return
  console.log('[cron] Running daily Adzuna refresh…')
  try {
    const { upserted } = await fetchAdzunaJobs()
    console.log(`[cron] Refreshed ${upserted} jobs`)
    resolveAdzunaUrls().catch(err => console.error('[resolve] Error:', err.message))
  } catch (err) {
    console.error('[cron] Refresh failed:', err.message)
  }
})

cron.schedule('0 * * * *', async () => {
  try {
    const result = await runDueDigestJobs(getDb())
    if (result.sent > 0) console.log(`[digest] Sent ${result.sent} overview digest email(s)`)
  } catch (err) {
    console.error('[digest] Scheduled digest failed:', err.message)
  }
})

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`)
})
