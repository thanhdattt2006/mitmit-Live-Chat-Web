import { create } from 'zustand';
import axiosClient from '../api/axiosClient';
import useStore from './useStore';
import socketService from '../api/socketClient';

/**
 * @typedef {Object} Message
 * @property {string} id - Unique message ID
 * @property {string} text - Message content
 * @property {boolean} isMe - Whether the message is from the local user
 * @property {number} timestamp - Unix timestamp in ms
 */

/**
 * @typedef {Object} RoomStore
 * @property {boolean} isMatching - True when actively searching for a match
 * @property {boolean} isConnected - True when a peer is connected
 * @property {MediaStream|null} localStream - Local webcam/mic stream (null = not started)
 * @property {MediaStream|null} remoteStream - Remote peer stream (null = not connected)
 * @property {Message[]} messages - Chat message history
 * @property {boolean} isMicOn - Local microphone toggle state
 * @property {boolean} isCamOn - Local camera toggle state
 */

const useRoomStore = create((set) => ({
  // Connection state
  isMatching: false,
  isConnected: false,
  localStream: null,
  remoteStream: null,

  // Chat
  messages: [
    { id: '1', text: 'Xin chào! 👋', isMe: false, timestamp: Date.now() - 60000 },
    { id: '2', text: 'Chào bạn, bạn từ đâu vậy?', isMe: true, timestamp: Date.now() - 50000 },
    { id: '3', text: 'Mình từ Hà Nội, còn bạn?', isMe: false, timestamp: Date.now() - 40000 },
    { id: '4', text: 'Mình ở TP.HCM nè! 🌆', isMe: true, timestamp: Date.now() - 30000 },
  ],

  // Media toggles
  isMicOn: true,
  isCamOn: true,

  // Actions
  /** Start searching for a match */
  startMatching: async () => {
    set({ isMatching: true, isConnected: false, messages: [] });
    try {
      const { userInfo, callMode } = useStore.getState();
      const userId = userInfo?.id || 'guest';

      socketService.connect(userId, (matchData) => {
        set({
          isMatching: false,
          isConnected: true,
          remoteUserId: matchData.user1Id === userId ? matchData.user2Id : matchData.user1Id,
          sessionId: matchData.sessionId
        });
      });

      await axiosClient.post('/api/v1/matchmaking/join', null, {
        params: { userId, callType: callMode }
      });
    } catch (error) {
      set({ isMatching: false });
      alert('Error joining matchmaking: ' + (error.response?.data?.message || error.message));
    }
  },

  /** Called when a peer is successfully connected */
  onConnected: () => set({ isMatching: false, isConnected: true }),

  /** Disconnect and reset streams */
  disconnect: async () => {
    socketService.disconnect();
    set({ isConnected: false, isMatching: false, remoteStream: null });
    try {
      const { userInfo, callMode } = useStore.getState();
      const userId = userInfo?.id || 'guest';
      await axiosClient.post('/api/v1/matchmaking/leave', null, {
        params: { userId, callType: callMode }
      });
    } catch (error) {
      console.error('Error leaving matchmaking:', error);
    }
  },

  stopCall: async () => {
    socketService.disconnect();
    set({ isConnected: false, isMatching: false, remoteStream: null });
    try {
      const { userInfo, callMode } = useStore.getState();
      const userId = userInfo?.id || 'guest';
      await axiosClient.post('/api/v1/matchmaking/leave', null, {
        params: { userId, callType: callMode }
      });
    } catch (error) {
      console.error('Error leaving matchmaking:', error);
    }
  },

  cancelMatching: async () => {
    set({ isConnected: false, isMatching: false });
    try {
      const { userInfo, callMode } = useStore.getState();
      const userId = userInfo?.id || 'guest';
      await axiosClient.post('/api/v1/matchmaking/leave', null, {
        params: { userId, callType: callMode }
      });
    } catch (error) {
      console.error('Error leaving matchmaking:', error);
    }
  },

  /** Skip to the next stranger */
  skipToNext: async () => {
    set({
      isMatching: true,
      isConnected: false,
      remoteStream: null,
      messages: [],
    });
    try {
      const { userInfo, callMode } = useStore.getState();
      const userId = userInfo?.id || 'guest';
      await axiosClient.post('/api/v1/matchmaking/join', null, {
        params: { userId, callType: callMode }
      });
    } catch (error) {
      set({ isMatching: false });
      alert('Error joining matchmaking: ' + (error.response?.data?.message || error.message));
    }
  },

  /**
   * Append a new message to the chat
   * @param {string} text
   * @param {boolean} isMe
   */
  sendMessage: (text, isMe = true) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { id: crypto.randomUUID(), text, isMe, timestamp: Date.now() },
      ],
    })),

  toggleMic: () => set((state) => ({ isMicOn: !state.isMicOn })),
  toggleCam: () => set((state) => ({ isCamOn: !state.isCamOn })),
}));

export default useRoomStore;
