import socket from "../socket";

class WebRTCService {
  constructor() {
    this.localStream = null;
    this.peerConnection = null;
    this.remoteStream = null;
    this.localVideoRef = null;
    this.remoteVideoRef = null;
    this.isCallActive = false;
    this.callType = null; // "voice" or "video"
  }

  initLocalMedia = async (callType) => {
    this.callType = callType;

    // Get local media (audio and/or video)
    const constraints = {
      audio: true,
      video: callType === 'video', // Enable video only for video calls
    };

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      if (this.localVideoRef) {
        this.localVideoRef.srcObject = this.localStream;
      }
    } catch (error) {
      console.error("Error accessing media devices", error);
    }
  };

  initPeerConnection = (remoteUserId) => {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302',
        },
      ],
    });

    // Add local stream tracks to the peer connection
    this.localStream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, this.localStream);
    });

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      if (!this.remoteStream) {
        this.remoteStream = event.streams[0];
        if (this.remoteVideoRef) {
          this.remoteVideoRef.srcObject = this.remoteStream;
        }
      }
    };

    // ICE Candidate Handling
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('candidate', {
          userId: remoteUserId,
          candidate: event.candidate,
        });
      }
    };

    // Create an offer or answer depending on the situation
    socket.emit('start-call', { userId: remoteUserId, callType: this.callType });
  };

  // Handle incoming offer
  handleOffer = async (offer, remoteUserId) => {
    await this.initPeerConnection(remoteUserId);
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    socket.emit('send-answer', {
      userId: remoteUserId,
      answer,
    });
  };

  // Handle incoming answer
  handleAnswer = (answer) => {
    this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  };

  // Handle incoming candidate
  handleCandidate = (candidate) => {
    this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  };

  // End call
  endCall = () => {
    this.isCallActive = false;
    this.localStream.getTracks().forEach(track => track.stop());
    this.peerConnection.close();
    socket.emit('end-call');
  };
}

export default new WebRTCService();
