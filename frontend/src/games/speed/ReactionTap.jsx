import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function ReactionTap({ difficulty, onComplete }) {
  const [status, setStatus] = useState('wait'); // wait, click, early, done
  const startTime = useRef(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    startWait();
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const startWait = () => {
    setStatus('wait');
    // Random delay between 1.5s and 4s
    const delay = 1500 + Math.random() * 2500;
    
    // Higher difficulty makes the target stay for less time, requiring faster reaction
    timeoutRef.current = setTimeout(() => {
      setStatus('click');
      startTime.current = Date.now();
      
      // Auto-fail if they don't click fast enough based on difficulty
      const maxWait = Math.max(300, 1500 - (difficulty * 100));
      timeoutRef.current = setTimeout(() => {
        if (status !== 'done') {
          handleFail(maxWait);
        }
      }, maxWait);

    }, delay);
  };

  const handleFail = (time) => {
    setStatus('done');
    onComplete({
      accuracy: 0,
      reactionTime: time,
      mistakes: 1,
      xp: 0
    });
  };

  const handleClick = () => {
    if (status === 'wait') {
      clearTimeout(timeoutRef.current);
      setStatus('early');
      setTimeout(() => {
        onComplete({
          accuracy: 0,
          reactionTime: 3000,
          mistakes: 1,
          xp: 0
        });
      }, 1000);
    } else if (status === 'click') {
      clearTimeout(timeoutRef.current);
      const rt = Date.now() - startTime.current;
      setStatus('done');
      
      // Accuracy degrades if they are slow
      const targetTime = Math.max(250, 600 - (difficulty * 30));
      let accuracy = 100;
      if (rt > targetTime) {
        accuracy = Math.max(20, 100 - ((rt - targetTime) / 10));
      }

      onComplete({
        accuracy,
        reactionTime: rt,
        mistakes: 0,
        xp: Math.round((accuracy / 100) * 15 * difficulty)
      });
    }
  };

  return (
    <div 
      className="w-full h-full flex items-center justify-center cursor-pointer select-none"
      onMouseDown={handleClick}
    >
      <motion.div 
        animate={{
          backgroundColor: status === 'wait' ? '#ef4444' : 
                           status === 'click' ? '#10b981' : 
                           status === 'early' ? '#f59e0b' : '#3b82f6',
          scale: status === 'click' ? 1.1 : 1
        }}
        className="w-48 h-48 sm:w-64 sm:h-64 rounded-full flex flex-col items-center justify-center text-white shadow-2xl"
      >
        <span className="text-2xl font-bold">
          {status === 'wait' && "WAIT"}
          {status === 'click' && "CLICK!"}
          {status === 'early' && "TOO EARLY"}
          {status === 'done' && "GOT IT"}
        </span>
      </motion.div>
    </div>
  );
}
