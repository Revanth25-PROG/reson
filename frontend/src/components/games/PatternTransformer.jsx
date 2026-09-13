import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function PatternTransformer({ data, onComplete }) {
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  const handleSelect = (option) => {
    const isCorrect = option === data.correctAnswer;
    onComplete(isCorrect, Date.now() - startTime);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg">
      <h2 className="text-2xl font-bold mb-8">What comes next?</h2>
      
      <div className="flex justify-center items-center gap-4 mb-12 flex-wrap">
        {data.sequence.map((num, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center text-2xl font-bold border border-white/10"
          >
            {num}
          </motion.div>
        ))}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: data.sequence.length * 0.1 }}
          className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center text-2xl font-bold border border-primary text-primary"
        >
          ?
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        {data.options.map((option, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(option)}
            className="bg-slate-800 hover:bg-slate-700 p-6 rounded-xl text-xl font-bold border border-white/5 transition-colors"
          >
            {option}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
