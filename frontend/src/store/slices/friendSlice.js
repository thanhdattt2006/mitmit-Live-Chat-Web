import axiosClient from '../../api/axiosClient';

export const createFriendSlice = (set, get) => ({
  friends: [],
  loadFriends: async () => {
    try {
      const response = await axiosClient.get('/api/v1/friendships/inbox');
      const data = response?.data || response;
      const currentUserId = get().userInfo?.id;
      const friendsList = data.map(f => {
        const isUser1 = f.user1?.id === currentUserId;
        const friendUser = isUser1 ? f.user2 : f.user1;
        return {
          id: friendUser?.id,
          friendshipId: f.id,
          name: friendUser?.anonymousName || friendUser?.name || 'Stranger',
          avatarUrl: friendUser?.avatarUrl || 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&w=150&q=80',
          lastMsg: ''
        };
      });
      set({ friends: friendsList });
    } catch (error) {
      console.error("Lỗi load danh sách bạn bè:", error);
    }
  },
  addFriend: (friend) => set((state) => ({ friends: [friend, ...state.friends] })),
  removeFriend: (id) => set((state) => ({ friends: state.friends.filter(f => f.id !== id) })),
});
