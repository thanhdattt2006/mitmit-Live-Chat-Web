import axiosClient from '../../api/axiosClient';
import socketService from '../../api/socketClient';
import webRTCClient from '../../api/webRTCClient';
import { translations } from '../../utils/translation';
import toast from 'react-hot-toast';

export const createMatchSlice = (set, get) => ({
  callMode: 'video',
  setCallMode: (mode) => set({ callMode: mode }),

  isMatching: false,
  isConnected: false,
  isMatched: false,
  remoteUserInfo: { name: '', avatarUrl: '' },
  roomSubscriptions: [],
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
           toast.error(t.TIMEOUT_NO_MATCH || "Timeout, no match");
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
           const remoteUserName = matchData.user1Id === userId ? matchData.user2Name : matchData.user1Name;
           const remoteUserAvatar = matchData.user1Id === userId ? matchData.user2Avatar : matchData.user1Avatar;
           
           set({
             isMatching: false,
             isConnected: true,
             remoteUserId,
             remoteUserInfo: { name: remoteUserName || '', avatarUrl: remoteUserAvatar || '' },
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
             const sub1 = socketService.stompClient.subscribe(`/topic/room/${matchData.sessionId}/match_success`, (message) => {
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
                const currentUserInfo = get().userInfo;
                if (currentUserInfo) {
                  set({ userInfo: { ...currentUserInfo, matchCount: (currentUserInfo.matchCount || 0) + 1 } });
                }
                get().loadFriends();
              } catch (err) {
                console.error("Lỗi parse data match_success:", err);
              }
            });

            const sub2 = socketService.stompClient.subscribe(`/topic/room/${matchData.sessionId}/chat`, (message) => {
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

            const sub3 = socketService.stompClient.subscribe(`/topic/room/${matchData.sessionId}/force_close`, () => {
              const state = get();
              if (state.stopCall) {
                state.stopCall(); 
              }
              const lang = state.lang || 'vi';
              const t = window.translations ? window.translations[lang] : { FORCE_CLOSE_ALERT: "Hết thời gian! Phán quyết không thành công" };
              toast.error(t.FORCE_CLOSE_ALERT || "Hết thời gian! Phán quyết không thành công", { duration: 4000 });
            });

            const sub4 = socketService.stompClient.subscribe(`/topic/room/${matchData.sessionId}/partner_left`, () => {
              set({ partnerDisconnectedTrigger: Date.now() });
            });

            set({ roomSubscriptions: [sub1, sub2, sub3, sub4] });
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
      toast.error((t.ERROR_MATCHING || 'Matching Error: ') + (error.response?.data?.message || error.message));
    }
  },
  
  setConnected: (connected) => set({ isConnected: connected, isMatching: false }),
  
  cancelMatching: async () => {
    const { matchTimeoutId } = get();
    if (matchTimeoutId) clearTimeout(matchTimeoutId);

    try {
      webRTCClient.close();
      const { roomSubscriptions } = get();
      roomSubscriptions?.forEach(sub => sub.unsubscribe());
      set({ roomSubscriptions: [] });
      
      const currentState = get();
      if (currentState.localStream) {
        currentState.localStream.getTracks().forEach(track => track.stop());
        currentState.setLocalStream?.(null);
      }
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
      const { roomSubscriptions } = get();
      roomSubscriptions?.forEach(sub => sub.unsubscribe());
      set({ roomSubscriptions: [] });
      
      const currentState = get();
      if (currentState.localStream) {
        currentState.localStream.getTracks().forEach(track => track.stop());
        currentState.setLocalStream?.(null);
      }
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
