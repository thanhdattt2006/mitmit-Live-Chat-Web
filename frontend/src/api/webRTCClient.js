import socketClient from './socketClient';

class WebRTCClient {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.onTrackCallback = null;
    this.currentUserId = null;
    this.targetUserId = null; // Store to send ICE candidates later
    this.config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: "stun:stun.relay.metered.ca:80" },
        {
          urls: "turn:global.relay.metered.ca:80",
          username: "1d14a28e26cd1e005c235354",
          credential: "2WfEEJ8dYOHJ0eNt",
        },
        {
          urls: "turn:global.relay.metered.ca:80?transport=tcp",
          username: "1d14a28e26cd1e005c235354",
          credential: "2WfEEJ8dYOHJ0eNt",
        },
        {
          urls: "turn:global.relay.metered.ca:443",
          username: "1d14a28e26cd1e005c235354",
          credential: "2WfEEJ8dYOHJ0eNt",
        },
        {
          urls: "turns:global.relay.metered.ca:443?transport=tcp",
          username: "1d14a28e26cd1e005c235354",
          credential: "2WfEEJ8dYOHJ0eNt",
        }
      ]
    };
  }

  // Initialize WebRTC connection
  initialize(currentUserId, onTrackCallback, onDisconnectCallback) {
    try {
      this.currentUserId = currentUserId;
      this.onTrackCallback = onTrackCallback;
      this.peerConnection = new RTCPeerConnection(this.config);

      this.peerConnection.oniceconnectionstatechange = () => {
        if (this.peerConnection.iceConnectionState === 'disconnected' || this.peerConnection.iceConnectionState === 'failed') {
          console.log('WebRTC: Partner disconnected');
          if (onDisconnectCallback) onDisconnectCallback();
        }
      };

      // Handle ICE Candidate
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate && this.targetUserId) {
          socketClient.send('/app/webrtc/signal', {
            senderId: this.currentUserId,
            targetUserId: this.targetUserId,
            type: 'ice',
            data: event.candidate
          });
          console.log('WebRTC: ICE candidate sent');
        }
      };

      // Handle incoming stream (Video/Audio)
      this.peerConnection.ontrack = (event) => {
        if (this.onTrackCallback && event.streams && event.streams[0]) {
          this.onTrackCallback(event.streams[0]);
          console.log('WebRTC: Remote track received');
        }
      };

      console.log('WebRTC: RTCPeerConnection initialized');
    } catch (error) {
      console.error('WebRTC: Error initializing RTCPeerConnection:', error);
    }
  }

  // Add local stream to connection
  addLocalStream(stream) {
    try {
      if (this.peerConnection && stream) {
        this.localStream = stream;
        stream.getTracks().forEach((track) => {
          this.peerConnection.addTrack(track, stream);
        });
        console.log('WebRTC: Local stream added');
      }
    } catch (error) {
      console.error('WebRTC: Error adding local stream:', error);
    }
  }

  // Create an Offer (Caller)
  async createOffer(targetUserId) {
    try {
      this.targetUserId = targetUserId;
      if (!this.peerConnection) return;

      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      socketClient.send('/app/webrtc/signal', {
        senderId: this.currentUserId,
        targetUserId: targetUserId,
        type: 'offer',
        data: offer
      });
      console.log('WebRTC: Offer created and sent');
    } catch (error) {
      console.error('WebRTC: Error creating offer:', error);
    }
  }

  // Handle received Offer (Callee)
  async handleReceiveOffer(offer, targetUserId) {
    try {
      this.targetUserId = targetUserId;
      if (!this.peerConnection) return;

      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      socketClient.send('/app/webrtc/signal', {
        senderId: this.currentUserId,
        targetUserId: targetUserId,
        type: 'answer',
        data: answer
      });
      console.log('WebRTC: Offer handled and Answer sent');
    } catch (error) {
      console.error('WebRTC: Error handling receive offer:', error);
    }
  }

  // Handle received Answer (Caller)
  async handleReceiveAnswer(answer) {
    try {
      if (!this.peerConnection) return;
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      console.log('WebRTC: Answer received and set');
    } catch (error) {
      console.error('WebRTC: Error handling receive answer:', error);
    }
  }

  // Handle received ICE Candidate
  async handleReceiveIceCandidate(candidate) {
    try {
      if (this.peerConnection && candidate) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('WebRTC: ICE candidate added');
      }
    } catch (error) {
      console.error('WebRTC: Error adding ICE candidate:', error);
    }
  }
  
  // Clean up connection
  close() {
      if (this.localStream) {
          this.localStream.getTracks().forEach(track => track.stop());
          this.localStream = null;
      }
      if (this.peerConnection) {
          this.peerConnection.close();
          this.peerConnection = null;
      }
      this.onTrackCallback = null;
      this.targetUserId = null;
      console.log('WebRTC: Connection closed and resources cleaned up');
  }
}

export default new WebRTCClient();
