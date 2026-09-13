const crypto = require('crypto');

class ChallengeEngine {
  constructor() {
    this.gameGenerators = {
      'memory-matrix': this.generateMemoryMatrix.bind(this),
      'pattern-transformer': this.generatePatternTransformer.bind(this),
      'logic-switch': this.generateLogicSwitch.bind(this),
    };
  }

  generateChallenge(gameId, difficulty) {
    if (!this.gameGenerators[gameId]) {
      throw new Error('Unknown game type');
    }
    
    // Generate a candidate challenge
    const challenge = this.gameGenerators[gameId](difficulty);
    
    // Calculate fingerprint to ensure zero-repetition
    const fingerprint = this.calculateFingerprint(gameId, challenge);
    challenge.fingerprint = fingerprint;
    
    return challenge;
  }

  calculateFingerprint(gameId, challengeData) {
    // A deterministic hash of the core challenge structure to prevent trivial repetitions
    const hashData = JSON.stringify({
      gameId,
      // For Memory Matrix, the exact grid layout and targets
      targets: challengeData.targets,
      gridSize: challengeData.gridSize,
      // For patterns, the exact sequence
      sequence: challengeData.sequence,
      // For logic, the constraints
      constraints: challengeData.constraints
    });
    return crypto.createHash('sha256').update(hashData).digest('hex');
  }

  // --- Specific Generators ---

  generateMemoryMatrix(difficulty) {
    // difficulty 1-100
    // size 3x3 to 6x6
    const gridSize = Math.floor(3 + (difficulty / 33)); // 3 to 6
    const numCells = gridSize * gridSize;
    const numTargets = Math.floor(3 + (difficulty / 20)); // 3 to 8
    
    const targets = new Set();
    while (targets.size < numTargets) {
      targets.add(Math.floor(Math.random() * numCells));
    }

    const duration = Math.max(1000, 3000 - (difficulty * 20)); // less time at higher difficulty

    return {
      type: 'memory-matrix',
      gridSize,
      targets: Array.from(targets),
      duration,
      colorScheme: Math.random() > 0.5 ? 'blue' : 'purple'
    };
  }

  generatePatternTransformer(difficulty) {
    // Example: generate a number pattern
    const families = ['arithmetic', 'geometric', 'alternating'];
    const family = families[Math.floor(Math.random() * families.length)];
    
    let sequence = [];
    let answer;
    
    if (family === 'arithmetic') {
      const step = Math.floor(Math.random() * (difficulty / 5)) + 1;
      let current = Math.floor(Math.random() * 20);
      for (let i = 0; i < 4; i++) {
        sequence.push(current);
        current += step;
      }
      answer = current;
    } else if (family === 'geometric') {
      const multiplier = Math.floor(Math.random() * 3) + 2;
      let current = Math.floor(Math.random() * 5) + 1;
      for (let i = 0; i < 4; i++) {
        sequence.push(current);
        current *= multiplier;
      }
      answer = current;
    } else {
      const step1 = Math.floor(Math.random() * 5) + 1;
      const step2 = Math.floor(Math.random() * 5) + 1;
      let current = Math.floor(Math.random() * 10);
      for (let i = 0; i < 4; i++) {
        sequence.push(current);
        current = (i % 2 === 0) ? current + step1 : current - step2;
      }
      answer = current;
    }

    // Generate distractors
    const options = new Set([answer]);
    while(options.size < 4) {
      const offset = (Math.floor(Math.random() * 10) - 5) || 1;
      options.add(answer + offset);
    }

    return {
      type: 'pattern-transformer',
      family,
      sequence,
      options: Array.from(options).sort(() => Math.random() - 0.5),
      correctAnswer: answer
    };
  }

  generateLogicSwitch(difficulty) {
    // Generate a simple ordering logic puzzle
    const items = ['A', 'B', 'C', 'D'].slice(0, Math.floor(3 + difficulty / 40));
    // Provide rules.
    // For simplicity, just return an array in a shuffled order, and rules that describe that order.
    let shuffled = [...items].sort(() => Math.random() - 0.5);
    
    let rules = [];
    for (let i = 0; i < shuffled.length - 1; i++) {
      rules.push(`${shuffled[i]} comes before ${shuffled[i+1]}`);
    }
    
    if (difficulty > 50 && items.length > 2) {
      rules.push(`${shuffled[0]} is the very first`);
    }

    return {
      type: 'logic-switch',
      items,
      rules: rules.sort(() => Math.random() - 0.5),
      correctOrder: shuffled
    };
  }
}

module.exports = new ChallengeEngine();
