import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      // Theme
      theme: 'dark', // default
      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: newTheme });
        const root = document.documentElement;
        if (newTheme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      },
      
      initTheme: () => {
        const root = document.documentElement;
        if (get().theme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      },

      // Language
      lang: 'en',
      setLang: (lang) => set({ lang }),
      
      // User Info
      userInfo: null, 
      setUserInfo: (info) => set({ userInfo: info }),

      // Global stats
      onlineCount: 1204,
      updateOnlineCount: () => set((state) => {
        const change = Math.floor(Math.random() * 11) - 5;
        return { onlineCount: Math.max(1000, state.onlineCount + change) };
      }),

      // Call Mode: 'video' | 'voice' | 'text'
      callMode: 'video',
      setCallMode: (mode) => set({ callMode: mode }),

      // Call State
      isMatching: false,
      isConnected: false,
      startMatching: () => set({ isMatching: true, isConnected: false }),
      setConnected: (connected) => set({ isConnected: connected, isMatching: false }),

      // Chat Messages
      messages: [],
      addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'mitmit-storage',
      partialize: (state) => ({ theme: state.theme, lang: state.lang, userInfo: state.userInfo, callMode: state.callMode }),
    }
  )
);

export default useStore;
