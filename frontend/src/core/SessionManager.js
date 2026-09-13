export const GAME_TYPES = {
  MEMORY_MATRIX: { id: 'memory_matrix', name: 'Grid Memory', domain: 'memory', component: 'MemoryMatrix' },
  TARGET_DETECTION: { id: 'target_detection', name: 'Distractor Hunt', domain: 'attention', component: 'TargetDetection' },
  REACTION_TAP: { id: 'reaction_tap', name: 'Speed Tap', domain: 'speed', component: 'ReactionTap' },
  RULE_SWITCH: { id: 'rule_switch', name: 'Rule Switch', domain: 'flexibility', component: 'RuleSwitch' },
};

export class SessionManager {
  /**
   * Generates a personalized array of games for a daily session.
   * Focuses more on the user's weakest domains.
   * @param {Object} profile - The user's cognitive profile scores
   * @returns {Array} List of game configurations to play
   */
  static generateDailySession(profile) {
    // Determine weakest domain
    const domains = Object.keys(profile);
    domains.sort((a, b) => profile[a] - profile[b]);
    const weakestDomain = domains[0];
    const secondWeakest = domains[1];

    const allGames = Object.values(GAME_TYPES);
    
    let session = [];
    
    // 1. Warm up (Random game)
    session.push(this.getRandomGame(allGames));
    
    // 2. Focus on weakest domain
    session.push(this.getGameByDomain(allGames, weakestDomain));
    
    // 3. Focus on second weakest
    session.push(this.getGameByDomain(allGames, secondWeakest));
    
    // 4. Random balanced challenge
    session.push(this.getRandomGame(allGames));

    // Map to include initial difficulty based on domain score (scale 0-100 -> 1-10)
    return session.map((game, index) => {
      // Start difficulty slightly below their actual skill level for warmup, scaling up
      const domainScore = profile[game.domain] || 50;
      let startDiff = (domainScore / 10);
      
      // Warmup is easier
      if (index === 0) startDiff = Math.max(1, startDiff - 2);

      return {
        ...game,
        initialDifficulty: Math.max(1, Math.min(10, startDiff))
      };
    });
  }

  static getRandomGame(games) {
    return games[Math.floor(Math.random() * games.length)];
  }

  static getGameByDomain(games, domain) {
    const domainGames = games.filter(g => g.domain === domain);
    if (domainGames.length === 0) return this.getRandomGame(games);
    return domainGames[Math.floor(Math.random() * domainGames.length)];
  }
}
