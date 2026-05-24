import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class SocketService {
  constructor() {
    this.stompClient = null;
  }

  connect(userId, onMatchSuccess, onSignalReceived) {
    return new Promise((resolve, reject) => {
      if (this.stompClient && this.stompClient.active) {
        this.disconnect();
      }

      const socketUrl = 'http://localhost:8080/ws';
      this.stompClient = new Client({
        webSocketFactory: () => new SockJS(socketUrl),
        connectHeaders: {
          userId: userId
        },
        reconnectDelay: 5000,
        onConnect: () => {
          console.log('STOMP Connected');
          this.stompClient.subscribe(`/topic/match/${userId}`, (message) => {
            if (message.body) {
              try {
                const data = JSON.parse(message.body);
                if (data.type === 'offer' || data.type === 'answer' || data.type === 'ice') {
                  console.log('Received WebRTC signal:', data.type);
                  if (onSignalReceived) onSignalReceived(data);
                } else if (data.sessionId) {
                  console.log('Received match:', data);
                  onMatchSuccess(data);
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
      console.log('Disconnected from STOMP');
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
