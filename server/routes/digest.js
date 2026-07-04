import express from 'express'
import { getDb } from '../db/database.js'
import { requireAuth } from '../middleware/auth.js'
import {
  buildDigest,
  getDigestPreference,
  saveDigestPreference,
  sendDigestNow,
} from '../services/digest.js'
import { isMailerConfigured } from '../services/mailer.js'

const router = express.Router()

router.get('/preferences', requireAuth, (req, res) => {
  const preference = getDigestPreference(getDb(), req.user)
  res.json({
    ...preference,
    mailer_configured: isMailerConfigured(),
  })
})

router.put('/preferences', requireAuth, (req, res) => {
  try {
    const preference = saveDigestPreference(getDb(), req.user, req.body || {})
    res.json({
      ...preference,
      mailer_configured: isMailerConfigured(),
    })
  } catch (error) {
    const status = error.status && Number.isInteger(error.status) ? error.status : 500
    res.status(status).json({ error: error.message || 'Digest preference could not be saved.' })
  }
})

router.get('/preview', requireAuth, (req, res) => {
  const digest = buildDigest(getDb(), req.user.id)
  res.json({
    subject: digest.subject,
    summary: digest.summary,
    text: digest.text,
  })
})

router.post('/send-test', requireAuth, async (req, res) => {
  try {
    const db = getDb()
    const preference = getDigestPreference(db, req.user)
    const recipient = req.body?.recipient_email || preference.recipient_email || req.user.email
    const result = await sendDigestNow(db, req.user, recipient)
    res.json({
      sent: true,
      recipient_email: recipient,
      provider_message_id: result.provider_message_id,
      subject: result.digest.subject,
    })
  } catch (error) {
    const status = error.status && Number.isInteger(error.status) ? error.status : 500
    res.status(status).json({ error: error.message || 'Digest email could not be sent.' })
  }
})

export default router
