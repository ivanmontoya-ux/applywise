import express from 'express'
import { extractCvProfileWithGemini, generateCoverLetterWithGemini, isGeminiConfigured, reviewCvWithGemini } from '../services/gemini.js'

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

router.post('/cover-letter', async (req, res) => {
  try {
    const letter = await generateCoverLetterWithGemini(req.body)
    res.json(letter)
  } catch (error) {
    const status = error.status && Number.isInteger(error.status) ? error.status : 500
    res.status(status).json({
      error: error.message || 'Cover letter generation failed.',
    })
  }
})

export default router
