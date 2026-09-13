import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, CheckCircle, XCircle, Lightbulb, Loader2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function Solve() {
  const { currentQuestion, isGenerating, isPreloading, user_id, consumeNext } = useAppStore();
  const navigate = useNavigate();
  
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (!isSubmitted && !isGenerating && currentQuestion) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isSubmitted, isGenerating, currentQuestion]);

  if (isGenerating || (!currentQuestion && isPreloading)) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <BrainCircuit className="h-16 w-16 text-blue-500 animate-pulse mb-4" />
        <h2 className="text-xl font-semibold">AI is crafting a unique challenge...</h2>
        <p className="text-gray-500">Checking patterns to ensure non-repetition.</p>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="text-center py-20">
        <p>No active question. Go back to Practice.</p>
        <button onClick={() => navigate('/practice')} className="mt-4 text-blue-600 underline">Practice Config</button>
      </div>
    );
  }

  const q = currentQuestion;

  const handleSubmit = async () => {
    if (!selectedAnswer) return;
    
    const correct = selectedAnswer === q.correct_answer;
    setIsCorrect(correct);
    setIsSubmitted(true);

    fetch('http://localhost:5000/api/questions/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id,
        question_id: q.question_id,
        topic: q.topic,
        difficulty: q.difficulty,
        answer_given: selectedAnswer,
        is_correct: correct,
        time_taken_seconds: timer,
        hints_used: showHint ? 1 : 0
      })
    }).catch(console.error);
  };

  const handleNext = () => {
    setSelectedAnswer('');
    setIsSubmitted(false);
    setIsCorrect(null);
    setShowHint(false);
    setTimer(0);
    consumeNext(q.topic, q.difficulty);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 relative">
        {isPreloading && (
          <div className="absolute top-4 right-4 flex items-center text-xs text-gray-400 gap-1">
            <Loader2 className="h-3 w-3 animate-spin" /> Preloading next...
          </div>
        )}
        <div className="flex justify-between items-center mb-6">
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded capitalize">
            {q.topic} • {q.difficulty}
          </span>
          <span className="text-gray-500 font-mono text-sm">
            Time: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
          </span>
        </div>

        <h2 className="text-xl font-medium text-gray-900 mb-6 leading-relaxed whitespace-pre-wrap">
          {q.question}
        </h2>
        
        {q.data && (
          <div className="bg-gray-50 p-4 rounded-md mb-6 font-mono text-sm">
            {JSON.stringify(q.data)}
          </div>
        )}

        <div className="space-y-3 mb-8">
          {q.options?.map((opt, idx) => {
            let itemClass = "w-full text-left p-4 rounded-lg border-2 transition-all ";
            
            if (isSubmitted) {
              if (opt === q.correct_answer) itemClass += "border-green-500 bg-green-50 text-green-900";
              else if (opt === selectedAnswer && !isCorrect) itemClass += "border-red-500 bg-red-50 text-red-900";
              else itemClass += "border-gray-200 opacity-50";
            } else {
              itemClass += selectedAnswer === opt 
                ? "border-blue-500 bg-blue-50 text-blue-900" 
                : "border-gray-200 hover:border-blue-300";
            }

            return (
              <button 
                key={idx}
                disabled={isSubmitted}
                onClick={() => setSelectedAnswer(opt)}
                className={itemClass}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {!isSubmitted ? (
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <button 
              onClick={() => setShowHint(true)}
              className="text-amber-600 flex items-center gap-2 hover:bg-amber-50 px-3 py-1.5 rounded-md transition"
            >
              <Lightbulb className="h-4 w-4" /> Need a hint?
            </button>
            <button 
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              className="bg-blue-600 text-white px-8 py-2.5 rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              Submit Answer
            </button>
          </div>
        ) : (
          <div className="mt-8 pt-6 border-t animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className={`flex items-center gap-3 mb-4 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {isCorrect ? <CheckCircle className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
              <h3 className="text-2xl font-bold">{isCorrect ? 'Correct!' : 'Not Quite.'}</h3>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Concept:</h4>
                <p className="text-gray-700">{q.concept}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Explanation:</h4>
                <p className="text-gray-700">{q.explanation}</p>
              </div>
              {q.reasoning_steps && q.reasoning_steps.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Step-by-step Reasoning:</h4>
                  <ol className="list-decimal pl-5 space-y-1 text-gray-700 text-sm">
                    {q.reasoning_steps.map((step, i) => <li key={i}>{step}</li>)}
                  </ol>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-4 justify-end">
              <button 
                onClick={() => navigate('/practice')}
                className="bg-gray-200 text-gray-900 px-6 py-2.5 rounded-md font-medium hover:bg-gray-300 transition"
              >
                Change Topic
              </button>
              <button 
                onClick={handleNext}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-md font-medium hover:bg-blue-700 transition flex items-center gap-2"
              >
                {isPreloading && <Loader2 className="h-4 w-4 animate-spin" />} Next Challenge
              </button>
            </div>
          </div>
        )}

        {showHint && !isSubmitted && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm flex gap-3 animate-in fade-in">
            <Lightbulb className="h-5 w-5 shrink-0" />
            <p>{q.hint}</p>
          </div>
        )}
      </div>
    </div>
  );
}