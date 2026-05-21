import { create } from 'zustand';

/**
 * @typedef {Object} Message
 * @property {string} id - Unique message ID
 * @property {string} text - Message content
 * @property {boolean} isMe - Whether the message is from the local user
 * @property {number} timestamp - Unix timestamp in ms
 */

const useRoomStore = create((set) => ({
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

  clearMessages: () => set({ messages: [] }),

  toggleMic: () => set((state) => ({ isMicOn: !state.isMicOn })),
  toggleCam: () => set((state) => ({ isCamOn: !state.isCamOn })),
}));

export default useRoomStore;
