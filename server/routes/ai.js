import express from 'express'
import { isGeminiConfigured, reviewCvWithGemini } from '../services/gemini.js'

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

export default router
