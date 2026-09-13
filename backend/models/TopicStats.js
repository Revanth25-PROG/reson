const mongoose = require('mongoose');

const topicStatsSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  topic: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  correct: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  average_time: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('TopicStats', topicStatsSchema);
