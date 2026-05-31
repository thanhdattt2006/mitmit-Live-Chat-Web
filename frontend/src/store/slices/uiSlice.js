export const createUiSlice = (set, get) => ({
  lang: 'en',
  setLang: (lang) => set({ lang }),
  
  isInboxOpen: false,
  setInboxOpen: (open) => set({ isInboxOpen: open }),

  onlineCount: 0,
  updateOnlineCount: async () => {
    try {
      const axiosClient = (await import('../../api/axiosClient')).default;
      const res = await axiosClient.get('/api/v1/stats/online-count');
      set({ onlineCount: res.data || 0 });
    } catch (error) {
      console.error("Lỗi lấy online count:", error);
    }
  },
});
