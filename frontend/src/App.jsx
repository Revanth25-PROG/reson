import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import PracticeConfig from './pages/PracticeConfig';
import Solve from './pages/Solve';
import { BrainCircuit, Play, TrendingUp } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                  <BrainCircuit className="h-8 w-8 text-blue-600" />
                  <span className="font-bold text-xl tracking-tight">LogicTrainer AI</span>
                </Link>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link to="/" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Dashboard
                  </Link>
                  <Link to="/practice" className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Practice Mode
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/practice" element={<PracticeConfig />} />
            <Route path="/solve" element={<Solve />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
