import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const SHAPES = ['circle', 'square'];
const COLORS = ['#3b82f6', '#f59e0b']; // blue, orange

export default function RuleSwitch({ difficulty, onComplete }) {
  const [currentRule, setCurrentRule] = useState('COLOR'); // COLOR or SHAPE
  const [card, setCard] = useState({ shape: 'circle', color: '#3b82f6' });
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  
  const startTime = useRef(0);
  const trials = useRef(0);
  const maxTrials = Math.min(20, 5 + Math.floor(difficulty * 2));
  
  // higher difficulty = faster rule switching
  const switchProb = Math.min(0.8, 0.2 + (difficulty * 0.05));

  useEffect(() => {
    startTime.current = Date.now();
    nextCard(currentRule);
  }, []);

  const nextCard = (rule) => {
    setCard({
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    });
    
    if (Math.random() < switchProb) {
      setCurrentRule(rule === 'COLOR' ? 'SHAPE' : 'COLOR');
    } else {
      setCurrentRule(rule);
    }
  };

  const handleChoice = (choiceVal, property) => {
    trials.current += 1;
    let isCorrect = false;

    if (currentRule === 'COLOR' && card.color === choiceVal) isCorrect = true;
    if (currentRule === 'SHAPE' && card.shape === choiceVal) isCorrect = true;

    if (isCorrect) setScore(s => s + 1);
    else setMistakes(m => m + 1);

    if (trials.current >= maxTrials) {
      const rt = (Date.now() - startTime.current) / maxTrials;
      const acc = (isCorrect ? score + 1 : score) / maxTrials * 100;
      onComplete({
        accuracy: acc,
        reactionTime: Math.round(rt),
        mistakes: isCorrect ? mistakes : mistakes + 1,
        xp: Math.round((acc / 100) * 12 * difficulty)
      });
    } else {
      nextCard(currentRule);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg">
      <div className="text-2xl font-bold mb-8 uppercase tracking-widest text-slate-300">
        Match By: <span className="text-white bg-white/10 px-3 py-1 rounded-md">{currentRule}</span>
      </div>

      <motion.div 
        key={trials.current}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-12 h-32 flex items-center justify-center"
      >
        {card.shape === 'circle' ? (
          <div className="w-24 h-24 rounded-full shadow-lg" style={{ backgroundColor: card.color }} />
        ) : (
          <div className="w-24 h-24 rounded-xl shadow-lg" style={{ backgroundColor: card.color }} />
        )}
      </motion.div>

      <div className="grid grid-cols-2 gap-4 w-full">
        <button 
          onClick={() => handleChoice(currentRule === 'COLOR' ? COLORS[0] : SHAPES[0])}
          className="p-6 bg-surface border border-white/10 hover:bg-white/5 rounded-xl flex flex-col items-center gap-2 transition-colors"
        >
          {currentRule === 'COLOR' ? (
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: COLORS[0] }} />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-400" />
          )}
          <span className="text-sm font-semibold uppercase">{currentRule === 'COLOR' ? 'Blue' : 'Circle'}</span>
        </button>
        
        <button 
          onClick={() => handleChoice(currentRule === 'COLOR' ? COLORS[1] : SHAPES[1])}
          className="p-6 bg-surface border border-white/10 hover:bg-white/5 rounded-xl flex flex-col items-center gap-2 transition-colors"
        >
          {currentRule === 'COLOR' ? (
             <div className="w-8 h-8 rounded-full" style={{ backgroundColor: COLORS[1] }} />
          ) : (
            <div className="w-8 h-8 rounded-md bg-slate-400" />
          )}
          <span className="text-sm font-semibold uppercase">{currentRule === 'COLOR' ? 'Orange' : 'Square'}</span>
        </button>
      </div>
    </div>
  );
}
