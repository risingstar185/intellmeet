const express = require('express');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getMeetings,
  createMeeting,
  getMeetingById,
  getLatestSummary,
 
  saveSummary,
  deleteMeeting,
} = require('../controllers/meetingController');


const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map(err => ({ field: err.path, message: err.msg })) });
  }
  next();
};

// All meeting routes require authorization
router.use(authMiddleware);

// Get all meetings for user
router.get('/', getMeetings);

// Create meeting
router.post(
  '/schedule',
  [
    body('title').trim().notEmpty().withMessage('Meeting title is required.'),
    body('scheduledAt').isISO8601().withMessage('A valid scheduled date/time is required.'),
  ],
  validate,
  createMeeting
);
router.get("/latest-summary", getLatestSummary);
// Get single meeting details
router.get('/:id', getMeetingById);


// Save summary & action items (AI processing outputs)
router.put(
  '/:id/summary',
  [
    body('summary').optional().trim(),
    body('transcript').optional().trim(),
    body('actionItems').optional().isArray().withMessage('Action items must be an array of tasks.'),
    body('actionItems.*.task').if(body('actionItems').exists()).notEmpty().withMessage('Action item task description is required.'),
  ],
  validate,
  saveSummary
);

// Delete meeting
router.delete('/:id', deleteMeeting);


module.exports = router;
