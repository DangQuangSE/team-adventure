const PROXIMITY_RADIUS = 150;
const RTC_CONFIG = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

export class ProximityVoice {
  constructor(store, socket, ui, getLocalPresence) {
    this.store = store;
    this.socket = socket;
    this.ui = ui;
    this.getLocalPresence = getLocalPresence;
    this.localStream = null;
    this.muted = true;
    this.peers = new Map();
    this.timer = null;
  }

  bindSocketEvents() {
    this.socket.on('webrtc-offer', payload => this.handleOffer(payload.senderId, payload.data));
    this.socket.on('webrtc-answer', payload => this.handleAnswer(payload.senderId, payload.data));
    this.socket.on('webrtc-ice-candidate', payload => this.handleIceCandidate(payload.senderId, payload.data));
    this.socket.on('webrtc-disconnect', payload => this.closePeer(payload.senderId, false));
  }

  start() {
    if (this.timer) {
      return;
    }
    this.timer = window.setInterval(() => this.reconcilePeers(), 350);
  }

  async setMuted(nextMuted) {
    this.muted = nextMuted;
    if (!this.muted) {
      await this.ensureLocalStream();
    }

    if (this.localStream) {
      for (const track of this.localStream.getAudioTracks()) {
        track.enabled = !this.muted;
      }
      for (const [peerId, peer] of this.peers.entries()) {
        this.attachLocalTracks(peer);
        if (peer.pc.signalingState === 'stable' && this.store.selfId < peerId) {
          peer.offerStarted = false;
        }
      }
    }

    const self = this.store.self();
    this.socket.send('change-media', {
      muted: this.muted,
      cameraOff: Boolean(self?.cameraOff)
    });
    this.ui.setMicState(this.muted);
    this.reconcilePeers();
  }

  async toggleMuted() {
    await this.setMuted(!this.muted);
  }

  async ensureLocalStream() {
    if (this.localStream) {
      return this.localStream;
    }

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });
      for (const track of this.localStream.getAudioTracks()) {
        track.enabled = !this.muted;
      }
      return this.localStream;
    } catch (error) {
      this.muted = true;
      this.ui.setMicState(true);
      this.ui.showToast('Microphone permission is required for proximity voice.');
      throw error;
    }
  }

  async reconcilePeers() {
    const selfId = this.store.selfId;
    const local = this.getLocalPresence();
    if (!selfId || !local) {
      return;
    }

    let activeCount = 0;
    for (const player of this.store.allPlayers()) {
      if (player.id === selfId) {
        continue;
      }

      const distance = Math.hypot(local.x - player.x, local.y - player.y);
      const samePrivateZone = local.zoneId && local.zoneId === player.zoneId;
      const bothPublicNearby = !local.zoneId && !player.zoneId && distance <= PROXIMITY_RADIUS;
      const shouldConnect = samePrivateZone || bothPublicNearby;

      if (shouldConnect) {
        activeCount += 1;
        const peer = await this.ensurePeer(player.id);
        this.setPeerVolume(peer, samePrivateZone ? 1 : 1 - distance / PROXIMITY_RADIUS);

        if (selfId < player.id && !peer.offerStarted) {
          peer.offerStarted = true;
          await this.createOffer(player.id);
        }
      } else if (this.peers.has(player.id)) {
        this.closePeer(player.id, true);
      }
    }

    this.ui.setVoiceState(activeCount);
  }

  async ensurePeer(peerId) {
    if (this.peers.has(peerId)) {
      return this.peers.get(peerId);
    }

    const pc = new RTCPeerConnection(RTC_CONFIG);
    const audio = document.createElement('audio');
    audio.autoplay = true;
    audio.playsInline = true;
    document.getElementById('remote-audio-root').append(audio);

    pc.addEventListener('icecandidate', event => {
      if (event.candidate) {
        this.socket.send('webrtc-ice-candidate', {
          targetId: peerId,
          data: event.candidate
        });
      }
    });

    pc.addEventListener('track', event => {
      audio.srcObject = event.streams[0];
    });

    pc.addEventListener('connectionstatechange', () => {
      if (['failed', 'closed', 'disconnected'].includes(pc.connectionState)) {
        this.closePeer(peerId, false);
      }
    });

    const peer = { pc, audio, offerStarted: false };
    this.peers.set(peerId, peer);
    this.attachLocalTracks(peer);
    return peer;
  }

  attachLocalTracks(peer) {
    if (!this.localStream || peer.hasLocalAudio) {
      return;
    }
    for (const track of this.localStream.getAudioTracks()) {
      peer.pc.addTrack(track, this.localStream);
    }
    peer.hasLocalAudio = true;
  }

  async createOffer(peerId) {
    const peer = await this.ensurePeer(peerId);
    const offer = await peer.pc.createOffer();
    await peer.pc.setLocalDescription(offer);
    this.socket.send('webrtc-offer', {
      targetId: peerId,
      data: peer.pc.localDescription
    });
  }

  async handleOffer(senderId, offer) {
    const peer = await this.ensurePeer(senderId);
    await peer.pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peer.pc.createAnswer();
    await peer.pc.setLocalDescription(answer);
    this.socket.send('webrtc-answer', {
      targetId: senderId,
      data: peer.pc.localDescription
    });
  }

  async handleAnswer(senderId, answer) {
    const peer = this.peers.get(senderId);
    if (!peer || peer.pc.signalingState === 'stable') {
      return;
    }
    await peer.pc.setRemoteDescription(new RTCSessionDescription(answer));
  }

  async handleIceCandidate(senderId, candidate) {
    const peer = await this.ensurePeer(senderId);
    await peer.pc.addIceCandidate(new RTCIceCandidate(candidate));
  }

  closePeer(peerId, notify) {
    const peer = this.peers.get(peerId);
    if (!peer) {
      return;
    }

    peer.pc.close();
    peer.audio.remove();
    this.peers.delete(peerId);

    if (notify) {
      this.socket.send('webrtc-disconnect', { targetId: peerId, data: {} });
    }
  }

  setPeerVolume(peer, volume) {
    peer.audio.volume = Math.max(0, Math.min(1, volume));
  }
}
