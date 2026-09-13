const mongoose = require('mongoose');

const gameAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gameId: {
    type: String, // e.g., 'memory-matrix', 'logic-switch'
    required: true
  },
  skill: {
    type: String,
    required: true
  },
  subSkill: {
    type: String
  },
  difficulty: {
    type: Number, // 1 to 100
    required: true
  },
  challengeFingerprint: {
    type: String, // to ensure no duplicates
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  responseTime: {
    type: Number, // in milliseconds
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  errorType: {
    type: String // e.g., 'timeout', 'wrong_target', 'omission'
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GameAttempt', gameAttemptSchema);
