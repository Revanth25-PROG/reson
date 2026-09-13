const GameAttempt = require('../models/GameAttempt');
const AIAnalysisService = require('../services/AIAnalysisService');

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Aggregate stats from GameAttempts
    const attempts = await GameAttempt.find({ userId }).sort({ completedAt: -1 }).limit(100);

    let totalGames = attempts.length;
    let correctGames = attempts.filter(a => a.isCorrect).length;
    let accuracy = totalGames > 0 ? (correctGames / totalGames) * 100 : 0;
    
    let averageResponseTime = attempts.reduce((acc, curr) => acc + curr.responseTime, 0) / (totalGames || 1);

    // Provide some AI insight based on recent attempts
    let aiInsight = 'Train more to receive personalized AI insights!';
    if (totalGames >= 5) {
      aiInsight = await AIAnalysisService.generateInsight(req.user.skillProfile, accuracy, averageResponseTime);
    }

    res.status(200).json({
      brainScore: req.user.brainScore,
      skillProfile: req.user.skillProfile,
      recentActivity: attempts.slice(0, 5),
      stats: {
        totalGames,
        accuracy: accuracy.toFixed(1),
        averageResponseTime: Math.round(averageResponseTime)
      },
      aiInsight
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching analytics' });
  }
};

module.exports = {
  getDashboardStats
};
