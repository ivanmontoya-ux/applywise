import express from 'express'
import { isGeminiConfigured } from '../services/gemini.js'
import { isMailerConfigured } from '../services/mailer.js'

const router = express.Router()

function has(value) {
  return Boolean(typeof value === 'string' && value.trim())
}

router.get('/status', (_req, res) => {
  const supabaseConfigured = has(process.env.SUPABASE_URL) && (
    has(process.env.SUPABASE_PUBLISHABLE_KEY)
    || has(process.env.SUPABASE_ANON_KEY)
    || has(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
    || has(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  )
  const googleConfigured = has(process.env.GOOGLE_CLIENT_ID) && has(process.env.GOOGLE_CLIENT_SECRET)

  res.json({
    setup_guide: 'SETUP.md',
    required: {
      supabase: {
        configured: supabaseConfigured,
        label: 'Supabase authentication and private storage',
        missing: supabaseConfigured ? [] : ['SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY'],
      },
      gemini: {
        configured: isGeminiConfigured(),
        label: 'Gemini AI CV, cover letter, and job recommendations',
        missing: isGeminiConfigured() ? [] : ['GEMINI_API_KEY'],
        model: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
      },
    },
    optional: {
      adzuna: {
        configured: has(process.env.ADZUNA_APP_ID) && has(process.env.ADZUNA_APP_KEY),
        label: 'Fresh job refresh from Adzuna',
        missing: has(process.env.ADZUNA_APP_ID) && has(process.env.ADZUNA_APP_KEY) ? [] : ['ADZUNA_APP_ID', 'ADZUNA_APP_KEY'],
      },
      gmail: {
        configured: googleConfigured,
        token_encryption_configured: has(process.env.GMAIL_TOKEN_ENCRYPTION_KEY) || has(process.env.GOOGLE_CLIENT_SECRET),
        label: 'Read-only Gmail application email import',
        missing: googleConfigured ? [] : ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
      },
      resend: {
        configured: isMailerConfigured(),
        label: 'Application overview email digest',
        missing: isMailerConfigured() ? [] : ['RESEND_API_KEY', 'DIGEST_FROM_EMAIL'],
      },
    },
  })
})

export default router
