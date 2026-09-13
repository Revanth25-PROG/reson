import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AdaptiveEngine } from '../../core/AdaptiveEngine';

export default function MemoryMatrix({ difficulty, onComplete }) {
  const [phase, setPhase] = useState('ready'); // ready, show, recall
  const [activeTiles, setActiveTiles] = useState([]);
  const [userTiles, setUserTiles] = useState([]);
  
  const startTime = useRef(0);
  const params = AdaptiveEngine.getParamsForMemoryMatrix(difficulty);
  const gridArray = Array.from({ length: params.gridSize * params.gridSize }, (_, i) => i);

  useEffect(() => {
    // Generate active tiles
    let newActive = [];
    while (newActive.length < params.tileCount) {
      let r = Math.floor(Math.random() * gridArray.length);
      if (!newActive.includes(r)) newActive.push(r);
    }
    setActiveTiles(newActive);

    // Sequence
    setTimeout(() => setPhase('show'), 1000);
    setTimeout(() => {
      setPhase('recall');
      startTime.current = Date.now();
    }, 1000 + params.showDuration);
  }, []);

  const handleTileClick = (index) => {
    if (phase !== 'recall') return;
    if (userTiles.includes(index)) return;

    const newSelected = [...userTiles, index];
    setUserTiles(newSelected);

    // Check if finished
    if (newSelected.length === activeTiles.length) {
      const reactionTime = Date.now() - startTime.current;
      const correctCount = newSelected.filter(t => activeTiles.includes(t)).length;
      const accuracy = (correctCount / activeTiles.length) * 100;
      
      setTimeout(() => {
        onComplete({
          accuracy,
          reactionTime,
          mistakes: activeTiles.length - correctCount,
          xp: Math.round((accuracy / 100) * 10 * difficulty)
        });
      }, 500);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-xl mb-6 h-8 text-center">
        {phase === 'ready' && "Get ready..."}
        {phase === 'show' && "Memorize the pattern"}
        {phase === 'recall' && "Recall the pattern!"}
      </h3>
      
      <div 
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${params.gridSize}, minmax(0, 1fr))` }}
      >
        {gridArray.map(i => {
          const isTarget = activeTiles.includes(i);
          const isSelected = userTiles.includes(i);
          const showTarget = (phase === 'show' && isTarget) || (phase === 'recall' && isSelected && isTarget);
          const showMistake = phase === 'recall' && isSelected && !isTarget;
          
          return (
            <motion.div
              key={i}
              whileTap={phase === 'recall' ? { scale: 0.9 } : {}}
              onClick={() => handleTileClick(i)}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 cursor-pointer transition-colors duration-200 ${
                showTarget ? 'bg-primary border-primary' :
                showMistake ? 'bg-error border-error' :
                'bg-surface border-white/10 hover:border-white/30'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
