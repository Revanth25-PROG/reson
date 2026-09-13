import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AdaptiveEngine } from '../../core/AdaptiveEngine';

const SHAPES = ['circle', 'square', 'triangle'];
const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#a855f7'];

export default function TargetDetection({ difficulty, onComplete }) {
  const [phase, setPhase] = useState('ready');
  const [items, setItems] = useState([]);
  const [targetProp, setTargetProp] = useState(null); // e.g. { color: '#ef4444', shape: 'circle' }
  const [foundCount, setFoundCount] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  
  const startTime = useRef(0);
  const params = AdaptiveEngine.getParamsForTargetDetection(difficulty);

  useEffect(() => {
    // Generate Target
    const tShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const tColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    setTargetProp({ shape: tShape, color: tColor });

    // Generate items
    let newItems = [];
    
    // Add targets
    for(let i=0; i<params.targets; i++) {
      newItems.push({ id: `t_${i}`, shape: tShape, color: tColor, isTarget: true, x: Math.random()*80, y: Math.random()*80 });
    }
    
    // Add distractors
    for(let i=0; i<params.distractors; i++) {
      let dShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      let dColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      
      // Make sure it's not exactly the target
      if (dShape === tShape && dColor === tColor) {
        dColor = COLORS[(COLORS.indexOf(tColor) + 1) % COLORS.length];
      }

      newItems.push({ id: `d_${i}`, shape: dShape, color: dColor, isTarget: false, x: Math.random()*80, y: Math.random()*80 });
    }

    // Shuffle
    newItems.sort(() => Math.random() - 0.5);
    setItems(newItems);

    setTimeout(() => {
      setPhase('play');
      startTime.current = Date.now();
    }, 2000);
  }, []);

  const handleClick = (item) => {
    if (phase !== 'play') return;

    if (item.isTarget) {
      setFoundCount(f => {
        const newC = f + 1;
        if (newC === params.targets) {
          endGame(mistakes);
        }
        return newC;
      });
      setItems(items.filter(i => i.id !== item.id)); // remove it
    } else {
      setMistakes(m => m + 1);
    }
  };

  const endGame = (finalMistakes) => {
    setPhase('done');
    const reactionTime = Date.now() - startTime.current;
    
    // Penalty for mistakes in accuracy
    let accuracy = 100 - (finalMistakes * 15); 
    accuracy = Math.max(0, accuracy);

    onComplete({
      accuracy,
      reactionTime,
      mistakes: finalMistakes,
      xp: Math.round((accuracy / 100) * 10 * difficulty)
    });
  };

  const renderShape = (item) => {
    const style = { backgroundColor: item.color };
    if (item.shape === 'circle') return <div className="w-8 h-8 rounded-full shadow-lg" style={style} />;
    if (item.shape === 'square') return <div className="w-8 h-8 rounded-md shadow-lg" style={style} />;
    if (item.shape === 'triangle') return (
      <div 
        className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[32px] shadow-lg drop-shadow-md" 
        style={{ borderBottomColor: item.color }} 
      />
    );
  };

  return (
    <div className="flex flex-col items-center w-full h-full relative">
      <h3 className="text-xl mb-4 h-8">
        {phase === 'ready' && "Find all targets!"}
        {phase === 'play' && targetProp && (
          <div className="flex items-center gap-3">
            Find all: {renderShape({ shape: targetProp.shape, color: targetProp.color })} ({foundCount}/{params.targets})
          </div>
        )}
      </h3>
      
      <div className="relative w-full flex-1 border border-white/10 rounded-xl bg-slate-950 overflow-hidden">
        {phase === 'play' && items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileTap={{ scale: 0.8 }}
            onClick={() => handleClick(item)}
            className="absolute cursor-pointer flex items-center justify-center p-2"
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
          >
            {renderShape(item)}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
