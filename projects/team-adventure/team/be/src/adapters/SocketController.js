// Interface Adapter: Socket.io Controller
class SocketController {
  constructor(io, playerUseCases) {
    this.io = io;
    this.playerUseCases = playerUseCases;
  }

  registerConnection(socket) {
    console.log(`[SocketController] Connection registered: ${socket.id}`);

    // 1. Join office
    socket.on('join-office', (data) => {
      const player = this.playerUseCases.joinOffice(socket.id, data);
      
      socket.emit('current-players', this.playerUseCases.getAllPlayers());
      socket.emit('note-updated', this.playerUseCases.getSharedNote());
      socket.broadcast.emit('new-player', player);

      console.log(`[SocketController] Player spawned: "${player.name}" (${player.id})`);
    });

    // 2. Movement
    socket.on('player-movement', (movementData) => {
      const player = this.playerUseCases.movePlayer(socket.id, movementData);
      if (player) {
        socket.broadcast.emit('player-moved', {
          id: player.id,
          x: player.x,
          y: player.y,
          direction: player.direction
        });
      }
    });

    // 3. Status changes
    socket.on('change-status', (status) => {
      const player = this.playerUseCases.changeStatus(socket.id, status);
      if (player) {
        socket.broadcast.emit('player-status-changed', {
          id: player.id,
          status: player.status
        });
      }
    });

    // 4. Media changes
    socket.on('change-media', (mediaState) => {
      const player = this.playerUseCases.changeMedia(socket.id, mediaState);
      if (player) {
        socket.broadcast.emit('player-media-changed', {
          id: player.id,
          isMuted: player.isMuted,
          isCamOff: player.isCamOff
        });
      }
    });

    // 5. Zone changes
    socket.on('change-zone', (zoneId) => {
      const player = this.playerUseCases.changeZone(socket.id, zoneId);
      if (player) {
        socket.broadcast.emit('player-zone-changed', {
          id: player.id,
          zoneId: player.zoneId
        });
      }
    });

    // 6. WebRTC Proximity Signaling forwarding
    socket.on('webrtc-offer', (payload) => {
      this.io.to(payload.targetId).emit('webrtc-offer', {
        senderId: socket.id,
        sdp: payload.sdp
      });
    });

    socket.on('webrtc-answer', (payload) => {
      this.io.to(payload.targetId).emit('webrtc-answer', {
        senderId: socket.id,
        sdp: payload.sdp
      });
    });

    socket.on('webrtc-ice-candidate', (payload) => {
      this.io.to(payload.targetId).emit('webrtc-ice-candidate', {
        senderId: socket.id,
        candidate: payload.candidate
      });
    });

    socket.on('webrtc-disconnect', (payload) => {
      this.io.to(payload.targetId).emit('webrtc-disconnect', {
        senderId: socket.id
      });
    });

    // 7. Notepad edits
    socket.on('edit-note', (newText) => {
      const note = this.playerUseCases.updateSharedNote(newText);
      socket.broadcast.emit('note-updated', note);
    });

    // 8. Disconnect
    socket.on('disconnect', () => {
      const player = this.playerUseCases.disconnectPlayer(socket.id);
      if (player) {
        console.log(`[SocketController] Player disconnected: ${player.name} (${socket.id})`);
        this.io.emit('player-disconnected', socket.id);
      }
    });
  }
}

module.exports = SocketController;
