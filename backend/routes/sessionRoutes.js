const express = require('express');
const router = express.Router();
const { getNextChallenge, submitChallengeResult } = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/next', protect, getNextChallenge);
router.post('/submit', protect, submitChallengeResult);

module.exports = router;
