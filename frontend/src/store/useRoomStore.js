import { create } from 'zustand';

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
 * @property {number} coins - User's coin balance
 * @property {number} freeChats - Remaining free chat sessions
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

  // Economy
  coins: 0,
  freeChats: 10,

  // Media toggles
  isMicOn: true,
  isCamOn: true,

  // Actions
  /** Start searching for a match */
  startMatching: () => set({ isMatching: true, isConnected: false, messages: [] }),

  /** Called when a peer is successfully connected */
  onConnected: () => set({ isMatching: false, isConnected: true }),

  /** Disconnect and reset streams */
  disconnect: () => set({ isConnected: false, isMatching: false, remoteStream: null }),

  /** Skip to the next stranger */
  skipToNext: () =>
    set((state) => ({
      isMatching: true,
      isConnected: false,
      remoteStream: null,
      messages: [],
      freeChats: Math.max(0, state.freeChats - 1),
    })),

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

  addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
}));

export default useRoomStore;
