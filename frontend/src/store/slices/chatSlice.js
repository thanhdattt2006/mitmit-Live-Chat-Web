export const createChatSlice = (set) => ({
  messages: [],
  setMessages: (updater) => set((state) => ({
    messages: typeof updater === 'function' ? updater(state.messages) : updater
  })),
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
