import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      // Auth
      isLoggedIn: false,
      login: () => set({ isLoggedIn: true }),
      logout: () => set({ isLoggedIn: false }),

      // Language
      lang: 'en',
      setLang: (lang) => set({ lang }),
      
      // User Info
      userInfo: {
        name: 'Guest',
        age: '18-21',
        gender: 'male',
        city: 'Hanoi',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80',
        role: 'ADMIN'
      }, 
      setUserInfo: (info) => set((state) => ({ userInfo: { ...state.userInfo, ...info } })),

      // Friends (Inbox)
      isInboxOpen: false,
      setInboxOpen: (open) => set({ isInboxOpen: open }),
      friends: [
        { id: 1, name: 'Anna Lee', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80', lastMsg: 'Hey, are you there?' },
      ],
      addFriend: (friend) => set((state) => ({ friends: [friend, ...state.friends] })),
      removeFriend: (id) => set((state) => ({ friends: state.friends.filter(f => f.id !== id) })),

      // Reports (Admin)
      reports: [
        { id: 1, reporter: 'Anna Lee', reportedUser: 'Stranger #1294', reason: 'Harassment', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80' },
        { id: 2, reporter: 'John Doe', reportedUser: 'Stranger #8429', reason: 'Spam', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80' }
      ],
      removeReport: (id) => set((state) => ({ reports: state.reports.filter(r => r.id !== id) })),

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
      stopCall: () => set({ isConnected: false, isMatching: false }),

      // Chat Messages
      messages: [],
      addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'mitmit-storage',
      partialize: (state) => ({ 
        lang: state.lang, 
        userInfo: state.userInfo, 
        callMode: state.callMode,
        isLoggedIn: state.isLoggedIn,
        friends: state.friends
      }),
    }
  )
);

export default useStore;
