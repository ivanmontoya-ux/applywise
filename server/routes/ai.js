import express from 'express'
import { extractCvProfileWithGemini, isGeminiConfigured, reviewCvWithGemini } from '../services/gemini.js'

const router = express.Router()

router.get('/status', (_req, res) => {
  res.json({
    gemini_configured: isGeminiConfigured(),
    model: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
  })
})

router.post('/cv-review', async (req, res) => {
  try {
    const review = await reviewCvWithGemini(req.body)
    res.json(review)
  } catch (error) {
    const status = error.status && Number.isInteger(error.status) ? error.status : 500
    res.status(status).json({
      error: error.message || 'CV review failed.',
    })
  }
})

router.post('/cv-extract', async (req, res) => {
  try {
    const profile = await extractCvProfileWithGemini(req.body)
    res.json(profile)
  } catch (error) {
    const status = error.status && Number.isInteger(error.status) ? error.status : 500
    res.status(status).json({
      error: error.message || 'CV extraction failed.',
    })
  }
})

export default router
