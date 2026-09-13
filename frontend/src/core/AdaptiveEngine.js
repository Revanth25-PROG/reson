export class AdaptiveEngine {
  /**
   * Adjusts the difficulty of the next trial based on the current trial's performance.
   * @param {number} currentDifficulty - Current level (e.g., 2.5)
   * @param {number} accuracy - Accuracy percentage (0-100)
   * @param {number} reactionTime - in milliseconds
   * @param {number} targetReactionTime - Expected baseline reaction time (ms)
   * @returns {number} New difficulty level
   */
  static calculateNextDifficulty(currentDifficulty, accuracy, reactionTime, targetReactionTime = 2000) {
    let adjustment = 0;

    // Accuracy is the primary driver
    if (accuracy >= 95) {
      adjustment += 0.4;
    } else if (accuracy >= 80) {
      adjustment += 0.2;
    } else if (accuracy >= 65) {
      adjustment -= 0.1;
    } else {
      adjustment -= 0.5;
    }

    // Reaction time modifier (only if accuracy is good enough)
    if (accuracy > 75) {
      if (reactionTime < targetReactionTime * 0.7) {
        adjustment += 0.1; // Very fast
      } else if (reactionTime > targetReactionTime * 1.5) {
        adjustment -= 0.1; // Too slow
      }
    }

    let nextDifficulty = currentDifficulty + adjustment;
    
    // Clamp difficulty to a realistic range (1.0 to 10.0 for example)
    return Math.max(1.0, Math.min(10.0, nextDifficulty));
  }

  /**
   * Translates a numeric difficulty (1-10) into game-specific parameters.
   * This is a utility that specific games can use.
   */
  static getParamsForMemoryMatrix(difficulty) {
    // difficulty 1: 3x3 grid, 3 tiles
    // difficulty 10: 6x6 grid, 12 tiles
    const gridSize = Math.min(6, 3 + Math.floor(difficulty / 3));
    const tileCount = Math.min(15, 2 + Math.floor(difficulty));
    const showDuration = Math.max(800, 3000 - (difficulty * 200));

    return { gridSize, tileCount, showDuration };
  }

  static getParamsForTargetDetection(difficulty) {
    const distractors = Math.min(40, 5 + Math.floor(difficulty * 3.5));
    const targets = Math.max(1, 4 - Math.floor(difficulty / 3)); // fewer targets = harder to find sometimes
    const timeLimit = Math.max(3000, 10000 - (difficulty * 600));

    return { distractors, targets, timeLimit };
  }
}
