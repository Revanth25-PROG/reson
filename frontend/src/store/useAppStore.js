import { create } from 'zustand';

export const useAppStore = create((set, get) => ({
  user_id: 'guest_user_123',
  currentQuestion: null,
  nextQuestion: null,
  isGenerating: false,
  isPreloading: false,

  setCurrentQuestion: (question) => set({ currentQuestion: question }),
  setIsGenerating: (status) => set({ isGenerating: status }),

  // Immediately generates a question (blocks UI with loading state)
  generateNow: async (topic, difficulty) => {
    set({ isGenerating: true });
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/questions/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, difficulty })
      });
      const data = await res.json();
      set({ currentQuestion: data, isGenerating: false });
      
      // Immediately start preloading the NEXT one in the background
      get().preloadNext(topic, difficulty);
    } catch (error) {
      console.error(error);
      set({ isGenerating: false });
    }
  },

  // Generates in the background without blocking the UI
  preloadNext: async (topic, difficulty) => {
    if (get().isPreloading) return;
    set({ isPreloading: true, nextQuestion: null });
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/questions/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, difficulty })
      });
      const data = await res.json();
      set({ nextQuestion: data, isPreloading: false });
    } catch (error) {
      console.error("Preload failed", error);
      set({ isPreloading: false });
    }
  },

  // Swaps the preloaded question to current, then preloads another
  consumeNext: (fallbackTopic, fallbackDifficulty) => {
    const { nextQuestion, generateNow, preloadNext } = get();
    if (nextQuestion) {
      // It's ready! Instant load.
      set({ currentQuestion: nextQuestion, nextQuestion: null });
      // Preload the next one
      preloadNext(fallbackTopic, fallbackDifficulty);
    } else {
      // User clicked next before preload finished, so we have to generate normally
      generateNow(fallbackTopic, fallbackDifficulty);
    }
  }
}));
