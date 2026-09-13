import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Target, Zap, Clock, TrendingUp } from 'lucide-react';
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

export default function Home() {
  const navigate = useNavigate();
  const userId = useAppStore(state => state.user_id);
  const { generateNow } = useAppStore();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/questions/stats/${userId}`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, [userId]);

  const startChallenge = async (topic, difficulty) => {
    navigate('/solve');
    await generateNow(topic, difficulty);
  };

  const handleDailyChallenge = () => {
    const randomTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    startChallenge(randomTopic, 'medium');
  };

  const handleWeakArea = () => {
    let weakTopic = 'Puzzle';
    if (stats && stats.stats && stats.stats.length > 0) {
      const weakest = [...stats.stats].sort((a, b) => a.accuracy - b.accuracy)[0];
      weakTopic = weakest.topic;
    }
    startChallenge(weakTopic, 'easy');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Reasoner!</h1>
        <p className="text-gray-500 mb-8">Ready to sharpen your logical thinking today?</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-100 flex flex-col items-center text-center">
            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg text-gray-900">Quick Challenge</h3>
            <p className="text-sm text-gray-500 mt-2 mb-4">Jump right into a random medium-level reasoning puzzle.</p>
            <button onClick={handleDailyChallenge} className="mt-auto bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition w-full">Start Challenge</button>
          </div>
          
          <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-100 flex flex-col items-center text-center">
            <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg text-gray-900">Topic Practice</h3>
            <p className="text-sm text-gray-500 mt-2 mb-4">Focus on specific areas like Syllogisms or Blood Relations.</p>
            <button onClick={() => navigate('/practice')} className="mt-auto bg-emerald-600 text-white px-4 py-2 rounded-md font-medium hover:bg-emerald-700 transition w-full">Choose Topic</button>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-6 border border-purple-100 flex flex-col items-center text-center">
            <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg text-gray-900">Weak Areas</h3>
            <p className="text-sm text-gray-500 mt-2 mb-4">We analyze your stats and drill your weakest topics.</p>
            <button onClick={handleWeakArea} className="mt-auto bg-purple-600 text-white px-4 py-2 rounded-md font-medium hover:bg-purple-700 transition w-full">Train Weaknesses</button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Your Performance Analytics</h2>
        {stats && stats.stats && stats.stats.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.stats.map(s => (
              <div key={s.topic} className="p-4 border rounded-lg bg-gray-50">
                <p className="text-sm font-medium text-gray-500">{s.topic}</p>
                <p className="text-2xl font-bold text-gray-900">{s.accuracy.toFixed(1)}%</p>
                <p className="text-xs text-gray-400 mt-1">{s.attempts} attempts</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Solve some questions to see your analytics here.</p>
        )}
      </div>
    </div>
  );
}
