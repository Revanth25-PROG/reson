import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

const TOPICS = [
  'Blood Relations',
  'Syllogism',
  'Number Series',
  'Coding-Decoding',
  'Direction Sense',
  'Seating Arrangement',
  'Puzzle'
];

export default function PracticeConfig() {
  const [topic, setTopic] = useState('Syllogism');
  const [difficulty, setDifficulty] = useState('medium');
  const navigate = useNavigate();
  const { generateNow } = useAppStore();

  const handleStart = async () => {
    navigate('/solve');
    await generateNow(topic, difficulty);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Setup Practice Session</h1>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Topic</label>
          <select 
            value={topic} 
            onChange={e => setTopic(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2"
          >
            {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
          <div className="flex gap-4">
            {['easy', 'medium', 'hard'].map(level => (
              <label key={level} className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="difficulty" 
                  value={level}
                  checked={difficulty === level}
                  onChange={e => setDifficulty(e.target.value)}
                  className="text-blue-600"
                />
                <span className="capitalize">{level}</span>
              </label>
            ))}
          </div>
        </div>
        
        <button 
          onClick={handleStart}
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-md hover:bg-blue-700 transition"
        >
          Generate AI Challenge
        </button>
      </div>
    </div>
  );
}