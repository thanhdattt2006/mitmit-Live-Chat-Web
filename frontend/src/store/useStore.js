import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosClient from '../api/axiosClient';
import socketService from '../api/socketClient';

const getDeviceId = () => {
  let deviceId = localStorage.getItem('mitmit_device_id');
  if (!deviceId) {
    deviceId = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    localStorage.setItem('mitmit_device_id', deviceId);
  }
  return deviceId;
};

const useStore = create(
  persist(
    (set, get) => ({
      // Auth
      isLoggedIn: false,
      isLoginModalOpen: false,
      setLoginModalOpen: (open) => set({ isLoginModalOpen: open }),
      login: () => set({ isLoggedIn: true }),
      logout: () => set((state) => {
        if (state.localStream) {
          state.localStream.getTracks().forEach(track => track.stop());
        }
        return { 
          isLoggedIn: false, 
          isMatching: false, 
          isConnected: false, 
          localStream: null 
        };
      }),

      localStream: null,
      setLocalStream: (stream) => set({ localStream: stream }),

      // Language
      lang: 'en',
      setLang: (lang) => set({ lang }),
      
      // Media Devices
      cameras: [],
      microphones: [],
      selectedCameraId: null,
      selectedMicId: null,
      setSelectedCameraId: (id) => set({ selectedCameraId: id }),
      setSelectedMicId: (id) => set({ selectedMicId: id }),
      fetchDevices: async () => {
        try {
          // Ask for permission to get real device labels
          const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
          const devices = await navigator.mediaDevices.enumerateDevices();
          const cameras = devices.filter(d => d.kind === 'videoinput');
          const microphones = devices.filter(d => d.kind === 'audioinput');
          
          set((state) => ({
            cameras,
            microphones,
            selectedCameraId: state.selectedCameraId || (cameras.length > 0 ? cameras[0].deviceId : null),
            selectedMicId: state.selectedMicId || (microphones.length > 0 ? microphones[0].deviceId : null)
          }));

          // Stop temp stream
          tempStream.getTracks().forEach(t => t.stop());
        } catch (error) {
          console.warn("Could not fetch devices or permission denied:", error);
        }
      },
      
      // User Info
      userInfo: {
        id: getDeviceId(),
        name: 'Guest',
        avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80',
        role: 'ADMIN'
      }, 
      setUserInfo: (info) => set((state) => ({ userInfo: { ...state.userInfo, ...info } })),

      // Friends (Inbox)
      isInboxOpen: false,
      setInboxOpen: (open) => set({ isInboxOpen: open }),
      friends: [
        { id: 1, name: 'Anna Lee', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80', lastMsg: 'Hey, are you there?' },
      ],
      addFriend: (friend) => set((state) => ({ friends: [friend, ...state.friends] })),
      removeFriend: (id) => set((state) => ({ friends: state.friends.filter(f => f.id !== id) })),

      // Reports (Admin)
      reports: [
        { id: 1, reporter: 'Anna Lee', reportedUser: 'Stranger #1294', reason: 'Harassment', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80' },
        { id: 2, reporter: 'John Doe', reportedUser: 'Stranger #8429', reason: 'Spam', avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80' }
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
      startMatching: async () => {
        set({ isMatching: true, isConnected: false });
        try {
          const { userInfo, callMode } = get();
          const userId = userInfo?.id;
          
      // Wait for socket to connect and subscribe BEFORE calling the API
      await socketService.connect(userId, (matchData) => {
        set({
          isMatching: false,
          isConnected: true,
          remoteUserId: matchData.user1Id === userId ? matchData.user2Id : matchData.user1Id,
          sessionId: matchData.sessionId
        });
      });

      // Now join the matchmaking queue
      await axiosClient.post('/api/v1/matchmaking/join', null, {
        params: { userId, callType: callMode }
      });
        } catch (error) {
          set({ isMatching: false });
          alert('Error joining matchmaking: ' + (error.response?.data?.message || error.message));
        }
      },
      setConnected: (connected) => set({ isConnected: connected, isMatching: false }),
      stopCall: async () => {
        socketService.disconnect();
        set({ isConnected: false, isMatching: false });
        try {
          const { userInfo, callMode } = get();
          const userId = userInfo?.id;
          await axiosClient.post('/api/v1/matchmaking/leave', null, {
            params: { userId, callType: callMode }
          });
        } catch (error) {
          console.error('Error leaving matchmaking:', error);
        }
      },

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
        friends: state.friends,
        selectedCameraId: state.selectedCameraId,
        selectedMicId: state.selectedMicId
      }),
    }
  )
);

export default useStore;
