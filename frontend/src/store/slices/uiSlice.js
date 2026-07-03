export const createUiSlice = (set) => ({
  lang: 'en',
  setLang: (lang) => set({ lang }),
  
  isInboxOpen: false,
  setInboxOpen: (open) => set({ isInboxOpen: open }),

  profanityWarning: null,
  setProfanityWarning: (strikes) => set({ profanityWarning: strikes }),

  onlineCount: 0,
  updateOnlineCount: async () => {
    try {
      const axiosClient = (await import('../../api/axiosClient')).default;
      const res = await axiosClient.get('/api/v1/stats/online-count');
      const count = typeof res === 'number' ? res : (res?.data || 0);
      set({ onlineCount: count });
    } catch (error) {
      console.error("Lỗi lấy online count:", error);
    }
  },
});
