import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Common wrapper for all mini-games.
 * Provides the top bar (Level, Domain, Timer), handles standardized end-screen,
 * and standardizes the callback.
 */
export default function GameInterface({ 
  gameName, 
  domain, 
  difficulty, 
  children, 
  onComplete 
}) {
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState(null);

  // Expose a function to children via cloneElement or context to finish the game
  const handleGameComplete = (performance) => {
    setResultData(performance);
    setShowResult(true);
    
    // Auto-advance after 2 seconds
    setTimeout(() => {
      onComplete(performance);
      setShowResult(false);
    }, 2500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[70vh] bg-surface rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      
      {/* Top Bar */}
      <div className="flex justify-between items-center p-4 bg-white/5 border-b border-white/10">
        <div>
          <h2 className="text-xl font-bold">{gameName}</h2>
          <span className="text-xs uppercase tracking-wider text-secondary">{domain}</span>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400">Difficulty</div>
          <div className="text-xl font-mono text-primary">{difficulty.toFixed(1)}</div>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 relative bg-slate-900/50">
        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div 
              key="game"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6"
            >
              {/* Inject handleGameComplete into the child game component */}
              {React.cloneElement(children, { onComplete: handleGameComplete, difficulty })}
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
            >
              <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-success to-primary bg-clip-text text-transparent">
                Challenge Complete!
              </h3>
              
              <div className="grid grid-cols-2 gap-6 w-full max-w-md">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="text-slate-400 text-sm mb-1">Accuracy</div>
                  <div className="text-2xl font-mono">{resultData?.accuracy.toFixed(0)}%</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <div className="text-slate-400 text-sm mb-1">Speed</div>
                  <div className="text-2xl font-mono">{resultData?.reactionTime}ms</div>
                </div>
              </div>
              
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="mt-8 text-xl font-bold text-yellow-400"
              >
                +{resultData?.xp || 10} XP
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
