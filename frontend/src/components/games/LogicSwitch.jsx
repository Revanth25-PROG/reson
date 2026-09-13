import React, { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';

export default function LogicSwitch({ data, onComplete }) {
  const [items, setItems] = useState(data.items);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  const handleSubmit = () => {
    const isCorrect = items.every((val, index) => val === data.correctOrder[index]);
    onComplete(isCorrect, Date.now() - startTime);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Drag to reorder based on the rules</h2>
      
      <div className="bg-slate-800/50 border border-white/5 p-6 rounded-xl mb-8 w-full">
        <ul className="list-disc pl-5 space-y-2 text-slate-300">
          {data.rules.map((rule, i) => (
            <li key={i}>{rule}</li>
          ))}
        </ul>
      </div>

      <Reorder.Group 
        axis="y" 
        values={items} 
        onReorder={setItems} 
        className="w-full space-y-3 mb-8"
      >
        {items.map((item) => (
          <Reorder.Item 
            key={item} 
            value={item}
            className="bg-slate-700 p-4 rounded-xl flex items-center justify-center font-bold text-xl cursor-grab active:cursor-grabbing border border-white/10"
          >
            {item}
          </Reorder.Item>
        ))}
      </Reorder.Group>

      <button 
        onClick={handleSubmit}
        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl transition-colors"
      >
        Submit Order
      </button>
    </div>
  );
}
