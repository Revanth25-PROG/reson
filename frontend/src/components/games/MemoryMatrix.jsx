import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function MemoryMatrix({ data, onComplete }) {
  const [phase, setPhase] = useState('memorize'); // 'memorize' -> 'recall' -> 'done'
  const [selected, setSelected] = useState([]);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase('recall');
      setStartTime(Date.now());
    }, data.duration);
    
    return () => clearTimeout(timer);
  }, [data.duration]);

  const handleCellClick = (index) => {
    if (phase !== 'recall') return;
    
    if (selected.includes(index)) {
      setSelected(selected.filter(i => i !== index));
    } else {
      const newSelected = [...selected, index];
      setSelected(newSelected);
      
      // Check if finished
      if (newSelected.length === data.targets.length) {
        setPhase('done');
        const endTime = Date.now();
        
        // Validate
        const isCorrect = newSelected.every(i => data.targets.includes(i)) && 
                          data.targets.every(i => newSelected.includes(i));
                          
        setTimeout(() => {
          onComplete(isCorrect, endTime - startTime);
        }, 500);
      }
    }
  };

  const gridSize = data.gridSize;
  const cells = Array.from({ length: gridSize * gridSize }).map((_, i) => i);

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-8">
        {phase === 'memorize' ? 'Memorize the highlighted tiles' : 'Recall the pattern'}
      </h2>
      
      <div 
        className="grid gap-2 p-4 bg-slate-800 rounded-xl"
        style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
      >
        {cells.map(i => {
          let isActive = false;
          if (phase === 'memorize' && data.targets.includes(i)) isActive = true;
          if (phase === 'recall' && selected.includes(i)) isActive = true;
          
          let bgColor = 'bg-slate-700';
          if (isActive) {
            bgColor = data.colorScheme === 'blue' ? 'bg-blue-500' : 'bg-purple-500';
          }

          return (
            <motion.div
              key={i}
              whileHover={phase === 'recall' ? { scale: 0.95 } : {}}
              whileTap={phase === 'recall' ? { scale: 0.9 } : {}}
              onClick={() => handleCellClick(i)}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg cursor-pointer transition-colors ${bgColor}`}
            />
          );
        })}
      </div>
    </div>
  );
}
