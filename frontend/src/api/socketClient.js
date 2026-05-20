import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class SocketService {
  constructor() {
    this.stompClient = null;
  }

  connect(userId, onMatchSuccess) {
    if (this.stompClient && this.stompClient.active) {
      this.disconnect();
    }

    const socketUrl = 'http://localhost:8080/ws';
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('Connected to STOMP via SockJS');
        this.stompClient.subscribe(`/topic/match/${userId}`, (message) => {
          if (message.body) {
            try {
              const data = JSON.parse(message.body);
              onMatchSuccess(data);
            } catch (err) {
              console.error('Failed to parse match data:', err);
            }
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
      onWebSocketError: (event) => {
        console.error('WebSocket connection error:', event);
      }
    });

    this.stompClient.activate();
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
      console.log('Disconnected from STOMP');
    }
  }
}

const socketService = new SocketService();
export default socketService;
