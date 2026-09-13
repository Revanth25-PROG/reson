const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question_id: { type: String, required: true, unique: true },
  topic: { type: String, required: true },
  subtopic: { type: String, required: true },
  difficulty: { type: String, required: true, enum: ['easy', 'medium', 'hard'] },
  pattern_id: { type: String, required: true },
  question_type: { type: String, required: true }, // mcq, true_false, fill_in_blank, etc.
  question: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed }, // Any additional JSON data for the question
  options: [{ type: String }], // For MCQ
  correct_answer: { type: mongoose.Schema.Types.Mixed, required: true }, // Can be string or array
  explanation: { type: String, required: true },
  concept: { type: String },
  reasoning_steps: [{ type: String }],
  hint: { type: String },
  estimated_time_seconds: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
