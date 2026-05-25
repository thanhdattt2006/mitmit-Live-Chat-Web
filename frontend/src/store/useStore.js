import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosClient from '../api/axiosClient';
import socketService from '../api/socketClient';
import webRTCClient from '../api/webRTCClient';

// ĐÃ TRẢM HÀM getDeviceId() - Không còn chốn dung thân cho bọn Anonymous nữa!

const useStore = create(
  persist(
    (set, get) => ({
      // ==========================================
      // 1. AUTHENTICATION & USER STATE (CẢI TỔ)
      // ==========================================
      isLoggedIn: false,
      token: null,
      userInfo: null, // Bắt đầu bằng null. Chỉ có data thật sau khi có Token
      isLoginModalOpen: false,

      setLoginModalOpen: (open) => set({ isLoginModalOpen: open }),

      // HÀM CHỦ CHỐT: Hứng Token từ OAuth2RedirectHandler
      loginWithToken: async (token) => {
        // 1. Lưu token vào localStorage để Axios Interceptor có thể lấy xài cho các API bảo mật
        localStorage.setItem('mitmit_jwt_token', token);
        
        // 2. Bật cờ đăng nhập và lưu token vào State
        set({ isLoggedIn: true, token: token });

        // 3. Gọi API lấy thông tin Profile thật của User từ Spring Boot
        try {
          const response = await axiosClient.get('/api/v1/users/me');
          set({ userInfo: response.data });
        } catch (error) {
          console.error("Lỗi khi kéo thông tin User Profile:", error);
          // Tạm thời set một cục data giả nếu mày chưa code API /users/me bên Backend
          // (Nhớ xóa cái fallback này sau khi Backend đã code xong API)
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
        localStorage.removeItem('mitmit_jwt_token');
        if (state.localStream) {
          state.localStream.getTracks().forEach(track => track.stop());
        }
        return { 
          isLoggedIn: false, 
          token: null,
          userInfo: null, // Xóa trắng info thật
          isMatching: false, 
          isConnected: false, 
          isMatched: false,
          remoteUserInfo: { name: '', avatarUrl: '' },
          localStream: null 
        };
      }),

      // ==========================================
      // 2. PHẦN CÒN LẠI (GIỮ NGUYÊN LOGIC CŨ)
      // ==========================================
      localStream: null,
      remoteStream: null,
      setLocalStream: (stream) => set({ localStream: stream }),

      lang: 'en',
      setLang: (lang) => set({ lang }),
      
      cameras: [],
      microphones: [],
      selectedCameraId: null,
      selectedMicId: null,
      setSelectedCameraId: (id) => set({ selectedCameraId: id }),
      setSelectedMicId: (id) => set({ selectedMicId: id }),
      
      fetchDevices: async () => {
        try {
          const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
          const devices = await navigator.mediaDevices.enumerateDevices();
          const cameras = devices.filter(d => d.kind === 'videoinput');
          const microphones = devices.filter(d => d.kind === 'audioinput');
          
          set((state) => ({
            cameras,
            microphones,
            selectedCameraId: state.selectedCameraId || (cameras.length > 0 ? cameras[0].deviceId : null),
            selectedMicId: state.selectedMicId || (microphones.length > 0 ? microphones[0].deviceId : null)
          }));

          tempStream.getTracks().forEach(t => t.stop());
        } catch (error) {
          console.warn("Lỗi lấy thiết bị Camera/Mic:", error);
        }
      },
      
      isInboxOpen: false,
      setInboxOpen: (open) => set({ isInboxOpen: open }),
      friends: [],
      addFriend: (friend) => set((state) => ({ friends: [friend, ...state.friends] })),
      removeFriend: (id) => set((state) => ({ friends: state.friends.filter(f => f.id !== id) })),

      reports: [],
      removeReport: (id) => set((state) => ({ reports: state.reports.filter(r => r.id !== id) })),

      onlineCount: 1204,
      updateOnlineCount: () => set((state) => {
        const change = Math.floor(Math.random() * 11) - 5;
        return { onlineCount: Math.max(1000, state.onlineCount + change) };
      }),

      callMode: 'video',
      setCallMode: (mode) => set({ callMode: mode }),

      isMatching: false,
      isConnected: false,
      isMatched: false,
      remoteUserInfo: { name: '', avatarUrl: '' },
      setMatching: (isMatching) => set({ isMatching }),
      
      sendMatchDecision: async () => {
        try {
          const { userInfo, sessionId } = get();
          await axiosClient.post('/api/v1/room/match', null, {
            params: { userId: userInfo?.id, sessionId }
          });
        } catch (error) {
          console.error('Lỗi khi thả tim:', error);
        }
      },

      startMatching: async () => {
        set({ 
          isMatching: true, 
          isConnected: false, 
          isMatched: false, 
          remoteUserInfo: { name: '', avatarUrl: '' } 
        });
        
        try {
          const { userInfo, callMode } = get();
          const userId = userInfo?.id;
          
          await socketService.connect(userId, 
            async (matchData) => {
              const remoteUserId = matchData.user1Id === userId ? matchData.user2Id : matchData.user1Id;
              set({
                isMatching: false,
                isConnected: true,
                remoteUserId,
                sessionId: matchData.sessionId
              });

              if (socketService.stompClient) {
                socketService.stompClient.subscribe(`/topic/room/${matchData.sessionId}/match_success`, (message) => {
                  try {
                    const data = JSON.parse(message.body);
                    set({
                      isMatched: true,
                      remoteUserInfo: {
                        name: data.matchedUserName,
                        avatarUrl: data.matchedUserAvatar
                      }
                    });
                  } catch (err) {
                    console.error("Lỗi parse data match_success:", err);
                  }
                });

                socketService.stompClient.subscribe(`/topic/room/${matchData.sessionId}/force_close`, (message) => {
                  // Force close event from backend (Time expired without match)
                  const state = get();
                  if (state.stopCall) {
                    state.stopCall(); // Terminate WebRTC and return to idle
                  }
                  // Notify user
                  const lang = state.lang || 'vi';
                  const t = window.translations ? window.translations[lang] : { FORCE_CLOSE_ALERT: "Hết thời gian! Phán quyết không thành công" };
                  alert(t.FORCE_CLOSE_ALERT || "Hết thời gian! Phán quyết không thành công");
                });
              }

              const currentState = get();
              webRTCClient.initialize(userId, (remoteStream) => {
                set({ remoteStream });
              });

              if (currentState.localStream) {
                webRTCClient.addLocalStream(currentState.localStream);
              }

              if (userId === matchData.user2Id) {
                await webRTCClient.createOffer(remoteUserId);
              }
            },
            async (signalData) => {
              if (signalData.type === 'offer') {
                await webRTCClient.handleReceiveOffer(signalData.data, signalData.senderId);
              } else if (signalData.type === 'answer') {
                await webRTCClient.handleReceiveAnswer(signalData.data);
              } else if (signalData.type === 'ice') {
                await webRTCClient.handleReceiveIceCandidate(signalData.data);
              }
            }
          );

          await axiosClient.post('/api/v1/matchmaking/join', null, {
            params: { userId, callType: callMode }
          });
        } catch (error) {
          set({ isMatching: false });
          alert('Lỗi ghép phòng: ' + (error.response?.data?.message || error.message));
        }
      },
      
      setConnected: (connected) => set({ isConnected: connected, isMatching: false }),
      
      cancelMatching: async () => {
        webRTCClient.close();
        socketService.disconnect();
        set({ isConnected: false, isMatching: false });
        try {
          const { userInfo, callMode } = get();
          const userId = userInfo?.id;
          if(userId) {
            await axiosClient.post('/api/v1/matchmaking/leave', null, {
              params: { userId, callType: callMode }
            });
          }
        } catch (error) {
          console.error('Lỗi thoát hàng đợi:', error);
        }
      },
      
      stopCall: async () => {
        webRTCClient.close();
        socketService.disconnect();
        set({ isConnected: false, isMatching: false });
        try {
          const { userInfo, callMode } = get();
          const userId = userInfo?.id;
          if(userId) {
            await axiosClient.post('/api/v1/matchmaking/leave', null, {
              params: { userId, callType: callMode }
            });
          }
        } catch (error) {
          console.error('Lỗi kết thúc cuộc gọi:', error);
        }
      },

      messages: [],
      addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'mitmit-storage',
      // CHÚ Ý: Đã bổ sung token và userInfo vào partialize để F5 không bị văng login
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
