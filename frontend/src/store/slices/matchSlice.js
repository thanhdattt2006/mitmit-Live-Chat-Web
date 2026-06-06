import axiosClient from '../../api/axiosClient';
import socketService from '../../api/socketClient';
import webRTCClient from '../../api/webRTCClient';
import { translations } from '../../utils/translation';

export const createMatchSlice = (set, get) => ({
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
           const t = translations[lang] || translations['vi'];
           
           const toast = document.createElement('div');
           toast.className = 'fixed top-10 left-1/2 -translate-x-1/2 z-[200] bg-neutral-800 text-white px-6 py-3 rounded-full shadow-2xl font-medium animate-slide-up flex items-center gap-2 border border-neutral-700';
           toast.innerHTML = `<span>${t.TIMEOUT_NO_MATCH || "Timeout, no match"}</span>`;
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
             sessionId: matchData.sessionId,
             matchEndTime: matchData.endTime
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
              const state = get();
              if (state.stopCall) {
                state.stopCall(); 
              }
              const lang = state.lang || 'vi';
              const t = window.translations ? window.translations[lang] : { FORCE_CLOSE_ALERT: "Hết thời gian! Phán quyết không thành công" };
              alert(t.FORCE_CLOSE_ALERT || "Hết thời gian! Phán quyết không thành công");
            });

            socketService.stompClient.subscribe(`/topic/room/${matchData.sessionId}/partner_left`, (message) => {
              const state = get();
              // Lập tức cleanup
              webRTCClient.close();
              const { matchTimeoutId } = state;
              if (matchTimeoutId) clearTimeout(matchTimeoutId);
              
              if (state.startMatching) {
                state.startMatching();
              }
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
      const lang = get().lang || 'vi';
      const t = window.translations ? window.translations[lang] : { ERROR_MATCHING: "Lỗi ghép phòng: " };
      alert((t.ERROR_MATCHING || 'Matching Error: ') + (error.response?.data?.message || error.message));
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
        const { callMode, sessionId } = get();
        await axiosClient.post('/api/v1/matchmaking/leave', null, {
          params: { callType: callMode }
        });
        if (sessionId) {
          await axiosClient.post('/api/v1/room/leave', null, {
            params: { sessionId }
          });
        }
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
        const { callMode, sessionId } = get();
        await axiosClient.post('/api/v1/matchmaking/leave', null, {
          params: { callType: callMode }
        });
        if (sessionId) {
          await axiosClient.post('/api/v1/room/leave', null, {
            params: { sessionId }
          });
        }
      } catch (error) {
        console.error('Lỗi kết thúc cuộc gọi:', error);
      }
    }
  },
});
