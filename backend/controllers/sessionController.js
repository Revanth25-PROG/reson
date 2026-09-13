const ChallengeEngine = require('../services/ChallengeEngine');
const ChallengeHistory = require('../models/ChallengeHistory');
const GameAttempt = require('../models/GameAttempt');
const User = require('../models/User');

// @desc    Generate next personalized challenge
// @route   GET /api/session/next
// @access  Private
const getNextChallenge = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Choose game based on some simple logic (could be improved by AI/adaptive logic later)
    const availableGames = ['memory-matrix', 'pattern-transformer', 'logic-switch'];
    const gameId = availableGames[Math.floor(Math.random() * availableGames.length)];
    
    const difficulty = req.user.skillProfile.memory || 50; // Simplify for now

    // Get user history for zero-repetition check
    let history = await ChallengeHistory.findOne({ userId });
    if (!history) {
      history = await ChallengeHistory.create({ userId, challengeFingerprints: [] });
    }

    let challenge;
    let attempts = 0;
    const maxAttempts = 50;
    
    // Loop until we find a novel challenge
    while (attempts < maxAttempts) {
      challenge = ChallengeEngine.generateChallenge(gameId, difficulty);
      if (!history.challengeFingerprints.includes(challenge.fingerprint)) {
        break;
      }
      attempts++;
    }

    if (attempts === maxAttempts) {
      return res.status(500).json({ message: 'Failed to generate a novel challenge. Please try again.' });
    }

    res.status(200).json({
      challenge,
      gameId,
      difficulty
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating challenge' });
  }
};

// @desc    Submit challenge result
// @route   POST /api/session/submit
// @access  Private
const submitChallengeResult = async (req, res) => {
  try {
    const { gameId, challengeFingerprint, isCorrect, responseTime, difficulty, skill } = req.body;
    const userId = req.user._id;

    // Save to history to ensure we never show it again
    await ChallengeHistory.findOneAndUpdate(
      { userId },
      { $addToSet: { challengeFingerprints: challengeFingerprint } },
      { upsert: true }
    );

    // Calculate score
    const score = isCorrect ? Math.floor(difficulty * (10000 / responseTime)) : 0;

    // Record attempt
    const attempt = await GameAttempt.create({
      userId,
      gameId,
      skill: skill || 'memory',
      difficulty,
      challengeFingerprint,
      isCorrect,
      responseTime,
      score
    });

    // Update user's brain score and skill profile (Adaptive Difficulty)
    const user = await User.findById(userId);
    
    const skillKey = skill || 'memory';
    if (isCorrect) {
      user.skillProfile[skillKey] = Math.min(100, user.skillProfile[skillKey] + 1);
      user.brainScore += 2;
    } else {
      user.skillProfile[skillKey] = Math.max(1, user.skillProfile[skillKey] - 1);
      user.brainScore -= 1;
    }

    await user.save();

    res.status(200).json({ message: 'Result saved', score, newDifficulty: user.skillProfile[skillKey] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error submitting result' });
  }
};

module.exports = {
  getNextChallenge,
  submitChallengeResult
};
