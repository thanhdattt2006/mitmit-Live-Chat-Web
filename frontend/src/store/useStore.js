import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      // Theme
      theme: 'dark', // default
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      
      // Language
      lang: 'en',
      setLang: (lang) => set({ lang }),
      
      // User Info (Onboarding)
      userInfo: null, // { gender: 'male', age: '18-21' }
      setUserInfo: (info) => set({ userInfo: info }),

      // Global stats
      onlineCount: 1204,
      updateOnlineCount: () => set((state) => {
        const change = Math.floor(Math.random() * 11) - 5; // -5 to +5
        return { onlineCount: Math.max(1000, state.onlineCount + change) };
      }),
      chatQuota: 10,
      decreaseQuota: () => set((state) => ({ chatQuota: Math.max(0, state.chatQuota - 1) })),
      addQuota: (amount) => set((state) => ({ chatQuota: state.chatQuota + amount })),

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
      partialize: (state) => ({ theme: state.theme, lang: state.lang, userInfo: state.userInfo }),
    }
  )
);

export default useStore;
