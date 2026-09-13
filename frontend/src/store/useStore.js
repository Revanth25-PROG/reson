import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const INITIAL_PROFILE = {
  memory: 50,
  attention: 50,
  speed: 50,
  logic: 50,
  flexibility: 50,
};

const useStore = create(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null }),

      // Player Progression
      xp: 0,
      level: 1,
      streak: 0,
      lastActive: null,
      
      // Cognitive Profile (0-100 scales)
      profile: { ...INITIAL_PROFILE },
      history: [], // Stores past session summaries for charts
      
      // Methods
      addXp: (amount) => set((state) => {
        const newXp = state.xp + amount;
        // Level up formula: level = floor(sqrt(xp) / 10) + 1 (just an example, let's say 100 XP per level for simplicity)
        const newLevel = Math.floor(newXp / 100) + 1;
        return { xp: newXp, level: newLevel };
      }),
      
      updateProfile: (domain, performanceDelta) => set((state) => {
        const newProfile = { ...state.profile };
        // Increase or decrease based on performance delta (clamped 0-100)
        let newValue = newProfile[domain] + performanceDelta;
        newValue = Math.max(0, Math.min(100, newValue));
        newProfile[domain] = newValue;
        return { profile: newProfile };
      }),

      logSession: (sessionData) => set((state) => {
        // Handle streak logic
        const now = new Date();
        const last = state.lastActive ? new Date(state.lastActive) : null;
        let newStreak = state.streak;
        
        if (last) {
          const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) newStreak += 1;
          else if (diffDays > 1) newStreak = 0; // reset if missed a day
        } else {
          newStreak = 1;
        }

        return {
          history: [...state.history, { date: now.toISOString(), ...sessionData }],
          lastActive: now.toISOString(),
          streak: newStreak
        };
      })
    }),
    {
      name: 'mindforge-storage-v2', // v2 to reset old state cleanly
    }
  )
);

export default useStore;
