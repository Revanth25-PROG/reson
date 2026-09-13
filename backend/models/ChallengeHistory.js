const mongoose = require('mongoose');

const challengeHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  challengeFingerprints: [{
    type: String
  }]
});

module.exports = mongoose.model('ChallengeHistory', challengeHistorySchema);
