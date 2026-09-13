import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from 'recharts';
import useStore from '../store/useStore';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, level, xp, streak, history, logout } = useStore();

  const handleStartTraining = () => {
    navigate('/arena');
  };

  const radarData = [
    { subject: 'Memory', A: profile.memory, fullMark: 100 },
    { subject: 'Attention', A: profile.attention, fullMark: 100 },
    { subject: 'Speed', A: profile.speed, fullMark: 100 },
    { subject: 'Logic', A: profile.logic, fullMark: 100 },
    { subject: 'Flexibility', A: profile.flexibility, fullMark: 100 },
  ];

  // Weakest domain for the coach
  const sortedDomains = [...radarData].sort((a, b) => a.A - b.A);
  const weakest = sortedDomains[0];
  const strongest = sortedDomains[4];

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name || 'Explorer'}</h1>
          <p className="text-slate-400">Your daily personalized training is ready.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={logout} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">Sign Out</button>
          <button 
            onClick={handleStartTraining}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all hover:scale-105"
          >
            Start Training
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Level Card */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-surface p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="text-slate-400 font-semibold mb-2 tracking-widest text-sm uppercase">Current Level</div>
          <div className="text-6xl font-bold text-white mb-2">{level}</div>
          <div className="text-sm text-primary font-mono">{xp} Total XP</div>
          <div className="w-full h-2 bg-slate-800 rounded-full mt-6 overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${(xp % 100)}%` }} />
          </div>
        </motion.div>

        {/* Streak Card */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-surface p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center">
          <div className="text-slate-400 font-semibold mb-2 tracking-widest text-sm uppercase">Daily Streak</div>
          <div className="text-6xl font-bold text-yellow-400 mb-2">{streak}</div>
          <div className="text-sm text-slate-400">days in a row</div>
        </motion.div>

        {/* AI Coach Insight */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 p-6 rounded-2xl border border-purple-500/20 relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300">🧠</div>
            <div className="font-bold text-purple-200">AI Coach</div>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            Your <strong className="text-white">{strongest.subject}</strong> is excellent! However, your <strong className="text-white">{weakest.subject}</strong> score is lagging at {Math.round(weakest.A)}. 
            Today's training session has been dynamically adjusted to include more {weakest.subject.toLowerCase()} exercises to round out your cognitive profile.
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Radar Chart */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-surface p-6 rounded-2xl border border-white/10 h-80 flex flex-col">
          <h3 className="font-bold mb-4">Cognitive Profile</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Profile" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* History Line Chart */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="bg-surface p-6 rounded-2xl border border-white/10 h-80 flex flex-col">
          <h3 className="font-bold mb-4">Recent Training Accuracy</h3>
          <div className="flex-1 w-full min-h-0">
            {history.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history.slice(-10)}>
                  <XAxis dataKey="date" tickFormatter={() => ''} stroke="#334155" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                    labelFormatter={() => 'Session'}
                  />
                  <Line type="monotone" dataKey="averageAccuracy" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
                Complete a session to see your history!
              </div>
            )}
          </div>
        </motion.div>
      </div>

    </div>
  );
}
