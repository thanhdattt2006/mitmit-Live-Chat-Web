import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createAuthSlice } from './slices/authSlice';
import { createUiSlice } from './slices/uiSlice';
import { createDeviceSlice } from './slices/deviceSlice';
import { createFriendSlice } from './slices/friendSlice';
import { createChatSlice } from './slices/chatSlice';
import { createMatchSlice } from './slices/matchSlice';

const useStore = create(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createUiSlice(...a),
      ...createDeviceSlice(...a),
      ...createFriendSlice(...a),
      ...createChatSlice(...a),
      ...createMatchSlice(...a),
    }),
    {
      name: 'mitmit-storage',
      partialize: (state) => ({ 
        lang: state.lang, 
        token: state.token,
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
