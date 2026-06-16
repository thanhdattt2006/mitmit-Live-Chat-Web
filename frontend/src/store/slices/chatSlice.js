export const createChatSlice = (set) => ({
  messages: [],
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  addTemporaryMessage: (tempMsg) => set((state) => ({ messages: [...state.messages, tempMsg] })),
  resolveTemporaryMessage: (tempId, realMsg) => set((state) => ({
    messages: state.messages.map((m) => m.id === tempId ? { ...realMsg } : m)
  })),
  removeTemporaryMessage: (tempId) => set((state) => ({
    messages: state.messages.filter((m) => m.id !== tempId)
  })),
  clearMessages: () => set({ messages: [] }),
});
