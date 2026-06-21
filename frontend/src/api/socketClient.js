import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class SocketService {
  constructor() {
    this.stompClient = null;
  }

  connect(userId, onMatchSuccess, onSignalReceived) {
    return new Promise((resolve, reject) => {
      this.onMatchSuccess = onMatchSuccess;
      this.onSignalReceived = onSignalReceived;

      if (this.stompClient && this.stompClient.active) {
        resolve();
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
      const socketUrl = `${apiUrl}/ws`;
      this.stompClient = new Client({
        webSocketFactory: () => new SockJS(socketUrl),
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        reconnectDelay: 5000,
        onWebSocketClose: () => {
          if (this.wasConnected) {
            import('react-hot-toast').then(({ default: toast }) => {
              toast.error("Mất kết nối, đang thử lại...", { id: 'ws-reconnect' });
            });
          }
        },
        onConnect: () => {
          if (this.wasConnected) {
            import('react-hot-toast').then(({ default: toast }) => {
              toast.success("Đã kết nối lại thành công", { id: 'ws-reconnect' });
            });
          }
          this.wasConnected = true;
          this.stompClient.subscribe(`/topic/match/${userId}`, (message) => {
            if (message.body) {
              try {
                const data = JSON.parse(message.body);
                if (data.type === 'offer' || data.type === 'answer' || data.type === 'ice') {
                  if (this.onSignalReceived) this.onSignalReceived(data);
                } else if (data.type === 'REFRESH_FRIENDS') {
                  import('../store/useStore').then((store) => {
                    store.default.getState().loadFriends();
                  });
                } else if (data.sessionId) {
                  if (this.onMatchSuccess) this.onMatchSuccess(data);
                }
              } catch (err) {
                console.error('Failed to parse match data:', err);
              }
            }
          });
          // Resolve Promise AFTER subscribing to ensure we don't miss messages
          resolve();
        },
        onStompError: (frame) => {
          console.error('Broker reported error: ' + frame.headers['message']);
          console.error('Additional details: ' + frame.body);
          reject(new Error(frame.headers['message']));
        },
        onWebSocketError: (event) => {
          console.error('WebSocket connection error:', event);
          reject(event);
        }
      });

      this.stompClient.activate();
    });
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
  }

  send(destination, body) {
    if (this.stompClient && this.stompClient.active) {
      this.stompClient.publish({
        destination: destination,
        body: JSON.stringify(body)
      });
    } else {
      console.error('Cannot send message: STOMP client is not active');
    }
  }
}

const socketService = new SocketService();
export default socketService;
