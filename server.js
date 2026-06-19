const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// In-memory state
const players = {};
let sharedNote = `📝 TEAM COLLABORATIVE WHITEBOARD & NOTES

Welcome to our Virtual Office!
Feel free to drop notes, coordinate schedules, or brainstorm ideas here. Everything is synced in real-time.

---
🎯 Today's Goals:
1. Finish the Phaser 3 frontend.
2. Complete WebRTC proximity audio/video integration.
3. Test private zones with the team.

⚡ Pro-tip: Walk close to other players to start a voice/video call!`;

io.on('connection', (socket) => {
  console.log(`[Server] Player connected: ${socket.id}`);

  // 1. Initial authentication & Spawning
  socket.on('join-office', (data) => {
    const { name, avatarStyle } = data;
    
    // Spawn point inside the lobby/office entrance
    const newPlayer = {
      id: socket.id,
      name: name || `Guest_${socket.id.slice(0, 4)}`,
      x: 400 + (Math.random() * 40 - 20), // slight offset so players don't stack directly
      y: 350 + (Math.random() * 40 - 20),
      direction: 'down',
      status: 'working', // 'working' | 'meeting' | 'away'
      isMuted: false,
      isCamOff: false,
      avatarStyle: avatarStyle || 'dev-blue',
      zoneId: null // default: outside private zones
    };

    players[socket.id] = newPlayer;

    // Send existing players & note to the new client
    socket.emit('current-players', players);
    socket.emit('note-updated', sharedNote);

    // Broadcast the new player to everyone else
    socket.broadcast.emit('new-player', newPlayer);
    console.log(`[Server] Player "${newPlayer.name}" joined the office.`);
  });

  // 2. Real-time movement synchronization
  socket.on('player-movement', (movementData) => {
    if (players[socket.id]) {
      players[socket.id].x = movementData.x;
      players[socket.id].y = movementData.y;
      players[socket.id].direction = movementData.direction;

      // Broadcast updated position to others
      socket.broadcast.emit('player-moved', {
        id: socket.id,
        x: movementData.x,
        y: movementData.y,
        direction: movementData.direction
      });
    }
  });

  // 3. User State Changes (Status, Mute, Camera, Zone)
  socket.on('change-status', (status) => {
    if (players[socket.id]) {
      players[socket.id].status = status;
      socket.broadcast.emit('player-status-changed', {
        id: socket.id,
        status: status
      });
    }
  });

  socket.on('change-media', (mediaState) => {
    if (players[socket.id]) {
      players[socket.id].isMuted = mediaState.isMuted;
      players[socket.id].isCamOff = mediaState.isCamOff;
      socket.broadcast.emit('player-media-changed', {
        id: socket.id,
        isMuted: mediaState.isMuted,
        isCamOff: mediaState.isCamOff
      });
    }
  });

  socket.on('change-zone', (zoneId) => {
    if (players[socket.id]) {
      players[socket.id].zoneId = zoneId;
      socket.broadcast.emit('player-zone-changed', {
        id: socket.id,
        zoneId: zoneId
      });
    }
  });

  // 4. WebRTC Proximity Signaling Broker
  // WebRTC client A requests contact with B
  socket.on('webrtc-offer', (payload) => {
    // payload: { targetId, sdp }
    io.to(payload.targetId).emit('webrtc-offer', {
      senderId: socket.id,
      sdp: payload.sdp
    });
  });

  // WebRTC client B answers A
  socket.on('webrtc-answer', (payload) => {
    // payload: { targetId, sdp }
    io.to(payload.targetId).emit('webrtc-answer', {
      senderId: socket.id,
      sdp: payload.sdp
    });
  });

  // Forward ICE candidates between A and B
  socket.on('webrtc-ice-candidate', (payload) => {
    // payload: { targetId, candidate }
    io.to(payload.targetId).emit('webrtc-ice-candidate', {
      senderId: socket.id,
      candidate: payload.candidate
    });
  });

  // Client requests manual disconnect of WebRTC peer stream
  socket.on('webrtc-disconnect', (payload) => {
    // payload: { targetId }
    io.to(payload.targetId).emit('webrtc-disconnect', {
      senderId: socket.id
    });
  });

  // 5. Collaborative Notepad sync
  socket.on('edit-note', (newText) => {
    sharedNote = newText;
    // Broadcast the updated note to everyone else
    socket.broadcast.emit('note-updated', sharedNote);
  });

  // 6. Handle Disconnection
  socket.on('disconnect', () => {
    if (players[socket.id]) {
      console.log(`[Server] Player disconnected: ${players[socket.id].name} (${socket.id})`);
      delete players[socket.id];
      io.emit('player-disconnected', socket.id);
    } else {
      console.log(`[Server] Connection closed before joining: ${socket.id}`);
    }
  });
});

server.listen(PORT, () => {
  console.log(`[Server] Virtual Office Server running on port ${PORT}`);
  console.log(`[Server] Local URL: http://localhost:${PORT}`);
});
