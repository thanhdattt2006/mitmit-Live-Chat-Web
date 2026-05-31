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
      setUserInfo: (userInfo) => set({ userInfo }),

      // HÀM CHỦ CHỐT: Hứng Token từ OAuth2RedirectHandler
      loginWithToken: async (token) => {
        // 1. Lưu token vào localStorage để Axios Interceptor có thể lấy xài cho các API bảo mật
        localStorage.setItem('mitmit_jwt_token', token);
        
        // 2. Bật cờ đăng nhập và lưu token vào State
        set({ isLoggedIn: true, token: token });

        // 3. Gọi API lấy thông tin Profile thật của User từ Spring Boot
        try {
          const response = await axiosClient.get('/api/v1/users/me');
          const data = response?.data || response;
          set({ userInfo: data });
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

      reports: [], // Bị loại bỏ vì đã tích hợp API thật
      removeReport: (id) => {}, // Placeholder để tương thích ngược nếu còn lỡ gọi

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
          const { sessionId } = get();
          await axiosClient.post('/api/v1/room/match', null, {
            params: { sessionId }
          });
        } catch (error) {
          console.error('Lỗi khi thả tim:', error);
        }
      },

      startMatching: async () => {
        const { matchTimeoutId: oldTimeout } = get();
        if (oldTimeout) clearTimeout(oldTimeout);

        const newTimeoutId = setTimeout(() => {
           const state = get();
           if (state.isMatching && !state.isConnected) {
               state.cancelMatching();
               const lang = state.lang || 'vi';
               const t = window.translations ? window.translations[lang] : { NO_ONE_ONLINE: "Không có ai online, vui lòng quay lại sau" };
               
               const toast = document.createElement('div');
               toast.className = 'fixed top-10 left-1/2 -translate-x-1/2 z-[200] bg-neutral-800 text-white px-6 py-3 rounded-full shadow-2xl font-medium animate-slide-up flex items-center gap-2 border border-neutral-700';
               toast.innerHTML = `<span>${t.NO_ONE_ONLINE || "Không có ai online, vui lòng quay lại sau"}</span>`;
               document.body.appendChild(toast);
               setTimeout(() => {
                 toast.style.opacity = '0';
                 toast.style.transition = 'opacity 0.3s ease';
                 setTimeout(() => toast.remove(), 300);
               }, 3000);
           }
        }, 60000);

        set({ 
          isMatching: true, 
          isConnected: false, 
          isMatched: false, 
          remoteUserInfo: { name: '', avatarUrl: '' },
          matchTimeoutId: newTimeoutId
        });
        
        try {
          const { userInfo, callMode } = get();
          const userId = userInfo?.id;
          
          await socketService.connect(userId, 
             (matchData) => {
               const { matchTimeoutId } = get();
               if (matchTimeoutId) clearTimeout(matchTimeoutId);

               const remoteUserId = matchData.user1Id === userId ? matchData.user2Id : matchData.user1Id;
               set({
                 isMatching: false,
                 isConnected: true,
                 remoteUserId,
                 sessionId: matchData.sessionId
               });

               if (callMode === 'text') {
                 const helloMsg = translations[get().lang || 'en']?.SYSTEM_MSG_HELLO || "You're now chatting with a random stranger. Say hi!";
                 set((state) => ({
                   messages: [...state.messages, { id: Date.now().toString(), type: 'system', text: helloMsg }]
                 }));
               }

              if (socketService.stompClient) {
                 socketService.stompClient.subscribe(`/topic/room/${matchData.sessionId}/match_success`, (message) => {
                  try {
                    const data = JSON.parse(message.body);
                    const isUser1 = data.user1Id === get().userInfo?.id;
                    set({
                      isMatched: true,
                      remoteUserInfo: {
                        name: isUser1 ? data.user2Name : data.user1Name,
                        avatarUrl: isUser1 ? data.user2Avatar : data.user1Avatar
                      }
                    });
                    get().loadFriends();
                  } catch (err) {
                    console.error("Lỗi parse data match_success:", err);
                  }
                });

                socketService.stompClient.subscribe(`/topic/room/${matchData.sessionId}/chat`, (message) => {
                  try {
                    const data = JSON.parse(message.body);
                    if (data.senderId !== get().userInfo?.id) {
                      set((state) => ({
                        messages: [...state.messages, {
                          id: data.id || Date.now().toString(),
                          type: 'user',
                          text: data.text,
                          isMine: false
                        }]
                      }));
                    }
                  } catch (err) {
                    console.error("Lỗi parse chat message:", err);
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
              }, () => {
                set({ partnerDisconnectedTrigger: Date.now() });
              });

              if (currentState.localStream) {
                webRTCClient.addLocalStream(currentState.localStream);
              }

              if (userId === matchData.user2Id) {
                webRTCClient.createOffer(remoteUserId);
              }
            },
             (signalData) => {
              if (signalData.type === 'offer') {
                webRTCClient.handleReceiveOffer(signalData.data, signalData.senderId);
              } else if (signalData.type === 'answer') {
                webRTCClient.handleReceiveAnswer(signalData.data);
              } else if (signalData.type === 'ice') {
                webRTCClient.handleReceiveIceCandidate(signalData.data);
              }
            }
          );

          await axiosClient.post('/api/v1/matchmaking/join', null, {
            params: { callType: callMode }
          });
        } catch (error) {
          set({ isMatching: false });
          alert('Lỗi ghép phòng: ' + (error.response?.data?.message || error.message));
        }
      },
      
      setConnected: (connected) => set({ isConnected: connected, isMatching: false }),
      
      cancelMatching: async () => {
        const { matchTimeoutId } = get();
        if (matchTimeoutId) clearTimeout(matchTimeoutId);

        try {
          webRTCClient.close();
          socketService.disconnect();
        } finally {
          set({ isConnected: false, isMatching: false });
          try {
            const { callMode } = get();
            await axiosClient.post('/api/v1/matchmaking/leave', null, {
              params: { callType: callMode }
            });
          } catch (error) {
            console.error('Lỗi thoát hàng đợi:', error);
          }
        }
      },
      
      stopCall: async () => {
        const { matchTimeoutId } = get();
        if (matchTimeoutId) clearTimeout(matchTimeoutId);

        try {
          webRTCClient.close();
          socketService.disconnect();
        } finally {
          set({ isConnected: false, isMatching: false });
          try {
            const { callMode } = get();
            await axiosClient.post('/api/v1/matchmaking/leave', null, {
              params: { callType: callMode }
            });
          } catch (error) {
            console.error('Lỗi kết thúc cuộc gọi:', error);
          }
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
