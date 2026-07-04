const express = require('express')
const { body, validationResult } = require('express-validator')
const router = express.Router()
const { generateSummary, extractActionItems } = require('../services/aiService')
const Meeting = require('../models/Meeting')
const auth = require('../middleware/authMiddleware')

// Helper to handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    })
  }
  next()
}

// Common validations for AI endpoints
const aiValidators = [
  body('transcript')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Transcript is too short or empty. Please provide at least 10 characters.'),
  body('meetingId')
    .optional()
    .isMongoId()
    .withMessage('meetingId must be a valid MongoDB ObjectId if provided.')
]

/**
 * POST /api/ai/summarize
 * Body: { transcript: string, meetingId?: string }
 * Returns: { summary: string }
 */
router.post('/summarize', auth, aiValidators, validate, async (req, res) => {
  try {
    const { transcript, meetingId } = req.body

    const summary = await generateSummary(transcript)

    // Optionally persist to the meeting document
    if (meetingId) {
      await Meeting.findByIdAndUpdate(meetingId, { summary, transcript }, { new: true })
    }

    res.json({ summary })
  } catch (error) {
    console.error('[AI /summarize]', error.message)

    if (error.message.includes('OPENAI_API_KEY')) {
      return res.status(503).json({ error: 'OpenAI API key not configured on this server.' })
    }
    if (error.status === 429 || error?.status === 429) {
      return res.status(429).json({ 
        error: 'AI service is busy. Please wait a moment and try again.' 
      })
    }

    res.status(500).json({ error: 'Failed to generate summary: ' + error.message })
  }
})

/**
 * POST /api/ai/action-items
 * Body: { transcript: string, meetingId?: string }
 * Returns: { actionItems: Array }
 */
router.post('/action-items', auth, aiValidators, validate, async (req, res) => {
  try {
    const { transcript, meetingId } = req.body

    const actionItems = await extractActionItems(transcript)

    if (meetingId) {
      await Meeting.findByIdAndUpdate(meetingId, { actionItems }, { new: true })
    }

    res.json({ actionItems })
  } catch (error) {
    console.error('[AI /action-items]', error.message)

    if (error.message.includes('OPENAI_API_KEY')) {
      return res.status(503).json({ error: 'OpenAI API key not configured on this server.' })
    }
    if (error instanceof SyntaxError) {
      return res.status(500).json({ error: 'AI returned an unexpected format. Please try again.' })
    }
    if (error.status === 429 || error?.status === 429) {
      return res.status(429).json({ 
        error: 'AI service is busy. Please wait a moment and try again.' 
      })
    }

    res.status(500).json({ error: 'Failed to extract action items: ' + error.message })
  }
})

/**
 * POST /api/ai/analyze
 * Runs both summary + action items in parallel.
 * Body: { transcript: string, meetingId?: string }
 * Returns: { summary: string, actionItems: Array }
 */
router.post('/analyze', auth, aiValidators, validate, async (req, res) => {
  try {
    const { transcript, meetingId } = req.body

    const [summary, actionItems] = await Promise.all([
      generateSummary(transcript),
      extractActionItems(transcript),
    ])

    if (meetingId) {
      await Meeting.findByIdAndUpdate(meetingId, { summary, actionItems, transcript }, { new: true })
    }

    res.json({ summary, actionItems })
  } catch (error) {
    console.error('[AI /analyze]', error.message)

    if (error.message.includes('OPENAI_API_KEY')) {
      return res.status(503).json({ error: 'OpenAI API key not configured on this server.' })
    }
    if (error instanceof SyntaxError) {
      return res.status(500).json({ error: 'AI returned an unexpected format. Please try again.' })
    }
    if (error.status === 429 || error?.status === 429) {
      return res.status(429).json({ 
        error: 'AI service is busy. Please wait a moment and try again.' 
      })
    }

    res.status(500).json({ error: 'Failed to analyze meeting: ' + error.message })
  }
})

module.exports = router
