const express = require('express');
const router = express.Router();
const { generateQuestion } = require('../services/ai.service');
const Attempt = require('../models/Attempt');
const TopicStats = require('../models/TopicStats');

// GET /api/questions/generate
router.post('/generate', async (req, res) => {
  try {
    const { topic, difficulty } = req.body;
    if (!topic || !difficulty) {
      return res.status(400).json({ message: "Topic and difficulty required" });
    }
    const question = await generateQuestion(topic, difficulty);
    res.json(question);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating question" });
  }
});

// POST /api/questions/submit
router.post('/submit', async (req, res) => {
  try {
    const { user_id, question_id, topic, difficulty, answer_given, is_correct, time_taken_seconds, hints_used } = req.body;
    
    const attempt = new Attempt({
      user_id, question_id, topic, difficulty, answer_given, is_correct, time_taken_seconds, hints_used
    });
    await attempt.save();

    // Update stats
    let stats = await TopicStats.findOne({ user_id, topic });
    if (!stats) {
      stats = new TopicStats({ user_id, topic });
    }
    
    const totalTime = stats.average_time * stats.attempts + time_taken_seconds;
    stats.attempts += 1;
    if (is_correct) stats.correct += 1;
    stats.accuracy = (stats.correct / stats.attempts) * 100;
    stats.average_time = totalTime / stats.attempts;
    
    await stats.save();
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error submitting answer" });
  }
});

// GET /api/questions/stats/:user_id
router.get('/stats/:user_id', async (req, res) => {
  try {
    const stats = await TopicStats.find({ user_id: req.params.user_id });
    const attempts = await Attempt.find({ user_id: req.params.user_id }).sort({ createdAt: -1 }).limit(10);
    res.json({ stats, recent_attempts: attempts });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats" });
  }
});
module.exports = router;

