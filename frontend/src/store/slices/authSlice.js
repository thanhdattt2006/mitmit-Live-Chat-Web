import axiosClient from '../../api/axiosClient';

export const createAuthSlice = (set) => ({
  isLoggedIn: false,
  token: null,
  userInfo: null,
  isLoginModalOpen: false,

  setLoginModalOpen: (open) => set({ isLoginModalOpen: open }),
  setUserInfo: (userInfo) => set({ userInfo }),

  loginWithToken: async () => {
    set({ isLoggedIn: true });

    try {
      const response = await axiosClient.get('/api/v1/users/me');
      const data = response?.data || response;
      set({ userInfo: data });
    } catch (error) {
      console.error("Lỗi khi kéo thông tin User Profile:", error);
      set({ 
        userInfo: { 
          id: 'temp-id-need-api', 
          name: 'Authenticated User', 
          avatarUrl: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&w=150&q=80',
          role: 'USER'
        } 
      });
    }
  },

  logout: () => set((state) => {
    axiosClient.post('/api/v1/auth/logout').catch(console.error);
    if (state.localStream) {
      state.localStream.getTracks().forEach(track => track.stop());
    }
    return { 
      isLoggedIn: false, 
      token: null,
      userInfo: null,
      isMatching: false, 
      isConnected: false, 
      isMatched: false,
      remoteUserInfo: { name: '', avatarUrl: '' },
      localStream: null 
    };
  }),
});
