import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { SessionManager, GAME_TYPES } from '../core/SessionManager';
import { AdaptiveEngine } from '../core/AdaptiveEngine';
import GameInterface from '../games/GameInterface';

// Import Games
import MemoryMatrix from '../games/memory/MemoryMatrix';
import TargetDetection from '../games/attention/TargetDetection';
import ReactionTap from '../games/speed/ReactionTap';
import RuleSwitch from '../games/logic/RuleSwitch';

const GAME_COMPONENTS = {
  MemoryMatrix,
  TargetDetection,
  ReactionTap,
  RuleSwitch
};

export default function GameArena() {
  const navigate = useNavigate();
  const { profile, addXp, updateProfile, logSession, level } = useStore();
  
  const [session, setSession] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [sessionResults, setSessionResults] = useState([]);

  useEffect(() => {
    // Generate the session sequence based on user profile
    const newSession = SessionManager.generateDailySession(profile);
    setSession(newSession);
  }, []);

  const handleGameComplete = (performance) => {
    const currentGame = session[currentIndex];
    
    // 1. Calculate new difficulty for this domain (to save for future)
    const nextDiff = AdaptiveEngine.calculateNextDifficulty(
      currentGame.initialDifficulty,
      performance.accuracy,
      performance.reactionTime
    );

    // 2. Profile adjustment (simplified mapping: -2 to +2 points based on accuracy/speed)
    let profileDelta = 0;
    if (performance.accuracy > 90) profileDelta = 1.5;
    else if (performance.accuracy > 70) profileDelta = 0.5;
    else if (performance.accuracy < 50) profileDelta = -1.5;

    // Apply updates
    addXp(performance.xp || 10);
    updateProfile(currentGame.domain, profileDelta);

    const result = {
      game: currentGame.name,
      domain: currentGame.domain,
      ...performance,
      nextDifficulty: nextDiff
    };

    setSessionResults(prev => [...prev, result]);

    // Next game
    if (currentIndex + 1 < session.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsFinished(true);
      logSession({
        gamesPlayed: session.length,
        totalXp: sessionResults.reduce((sum, r) => sum + (r.xp||0), 0) + (performance.xp||0),
        averageAccuracy: (sessionResults.reduce((sum, r) => sum + r.accuracy, 0) + performance.accuracy) / session.length
      });
    }
  };

  if (session.length === 0) {
    return <div className="text-center mt-20">Preparing your personalized session...</div>;
  }

  if (isFinished) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-8 bg-surface rounded-2xl border border-white/10 text-center">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Session Complete!
        </h2>
        <p className="text-slate-400 mb-8">You've reached Level {level}. Here is how you did today:</p>
        
        <div className="space-y-4 mb-8 text-left">
          {sessionResults.map((res, i) => (
            <div key={i} className="flex justify-between p-4 bg-white/5 rounded-xl">
              <div>
                <div className="font-bold">{res.game}</div>
                <div className="text-xs text-slate-400 uppercase">{res.domain}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-success">{res.accuracy.toFixed(0)}% acc</div>
                <div className="text-xs text-slate-400">{res.reactionTime}ms</div>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={() => navigate('/')}
          className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const currentGame = session[currentIndex];
  const ActiveComponent = GAME_COMPONENTS[currentGame.component];

  return (
    <div className="w-full flex flex-col pt-8">
      <div className="max-w-4xl mx-auto w-full mb-4 flex justify-between items-center text-sm text-slate-400">
        <div>Training {currentIndex + 1} of {session.length}</div>
        <div className="flex gap-1">
          {session.map((_, i) => (
            <div key={i} className={`w-8 h-1.5 rounded-full ${i <= currentIndex ? 'bg-primary' : 'bg-white/10'}`} />
          ))}
        </div>
      </div>
      
      <GameInterface 
        gameName={currentGame.name}
        domain={currentGame.domain}
        difficulty={currentGame.initialDifficulty}
        onComplete={handleGameComplete}
      >
        <ActiveComponent />
      </GameInterface>
    </div>
  );
}
