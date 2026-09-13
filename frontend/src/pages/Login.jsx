import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { motion } from 'framer-motion';
import { Brain, LogIn, UserPlus } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const setToken = useStore((state) => state.setToken);
  const setUser = useStore((state) => state.setUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: isLogin ? undefined : name }),
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Something went wrong');
      
      setToken(data.token);
      setUser(data);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-surface p-8 rounded-2xl shadow-2xl border border-white/5"
      >
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-primary/20 rounded-full">
            <Brain className="w-10 h-10 text-primary" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-6">
          {isLogin ? 'Welcome back to MindForge' : 'Begin your journey'}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-error/20 border border-error/50 text-error rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm text-slate-400 mb-1">Name</label>
              <input 
                type="text" 
                required
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary transition-colors"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm text-slate-400 mb-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary transition-colors"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-400 mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary transition-colors"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium p-3 rounded-lg flex items-center justify-center gap-2 transition-colors mt-6"
          >
            {isLogin ? <><LogIn size={18}/> Sign In</> : <><UserPlus size={18}/> Create Account</>}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-primary hover:underline font-medium"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
