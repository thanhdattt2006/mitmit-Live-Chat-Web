import socketClient from './socketClient';

class WebRTCClient {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.onTrackCallback = null;
    this.currentUserId = null;
    this.targetUserId = null; // Store to send ICE candidates later
    this.pendingCandidates = [];
    this.config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: "stun:stun.relay.metered.ca:80" },
        {
          urls: "turn:global.relay.metered.ca:80",
          username: import.meta.env.VITE_TURN_USERNAME,
          credential: import.meta.env.VITE_TURN_CREDENTIAL,
        },
        {
          urls: "turn:global.relay.metered.ca:80?transport=tcp",
          username: import.meta.env.VITE_TURN_USERNAME,
          credential: import.meta.env.VITE_TURN_CREDENTIAL,
        },
        {
          urls: "turn:global.relay.metered.ca:443",
          username: import.meta.env.VITE_TURN_USERNAME,
          credential: import.meta.env.VITE_TURN_CREDENTIAL,
        },
        {
          urls: "turns:global.relay.metered.ca:443?transport=tcp",
          username: import.meta.env.VITE_TURN_USERNAME,
          credential: import.meta.env.VITE_TURN_CREDENTIAL,
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
        }
      };

      // Handle incoming stream (Video/Audio)
      this.peerConnection.ontrack = (event) => {
        if (this.onTrackCallback && event.streams && event.streams[0]) {
          this.onTrackCallback(event.streams[0]);
        }
      };

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
          const sender = this.peerConnection.addTrack(track, stream);
          
          // Limit video bitrate to 500kbps (SD quality) to save mobile data
          if (track.kind === 'video') {
            const parameters = sender.getParameters();
            if (!parameters.encodings) {
              parameters.encodings = [{}];
            }
            parameters.encodings[0].maxBitrate = 500000; // 500 kbps
            sender.setParameters(parameters).catch(e => console.error("Failed to set bitrate limit:", e));
          }
        });
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
      this.processPendingCandidates();

      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      socketClient.send('/app/webrtc/signal', {
        senderId: this.currentUserId,
        targetUserId: targetUserId,
        type: 'answer',
        data: answer
      });
    } catch (error) {
      console.error('WebRTC: Error handling receive offer:', error);
    }
  }

  // Handle received Answer (Caller)
  async handleReceiveAnswer(answer) {
    try {
      if (!this.peerConnection) return;
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      this.processPendingCandidates();
    } catch (error) {
      console.error('WebRTC: Error handling receive answer:', error);
    }
  }

  // Handle received ICE Candidate
  async handleReceiveIceCandidate(candidate) {
    try {
      if (this.peerConnection && candidate) {
        if (this.peerConnection.remoteDescription) {
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          this.pendingCandidates.push(candidate);
        }
      }
    } catch (error) {
      console.error('WebRTC: Error adding ICE candidate:', error);
    }
  }

  async processPendingCandidates() {
    if (this.peerConnection && this.peerConnection.remoteDescription) {
      while (this.pendingCandidates.length > 0) {
        const candidate = this.pendingCandidates.shift();
        try {
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error('WebRTC: Error adding queued ICE candidate', e);
        }
      }
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
      this.pendingCandidates = [];
  }
}

export default new WebRTCClient();
