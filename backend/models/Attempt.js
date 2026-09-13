const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  user_id: { type: String, required: true }, // Simple string ID for now
  question_id: { type: String, required: true },
  topic: { type: String, required: true },
  difficulty: { type: String, required: true },
  answer_given: { type: mongoose.Schema.Types.Mixed, required: true },
  is_correct: { type: Boolean, required: true },
  time_taken_seconds: { type: Number, required: true },
  hints_used: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Attempt', attemptSchema);
