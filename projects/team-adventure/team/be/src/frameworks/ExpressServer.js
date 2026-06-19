// Frameworks & Drivers: Express & Socket.io Web Server
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

class ExpressServer {
  constructor(port, staticFilesPath) {
    this.port = port;
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    // Static Assets
    this.app.use(express.static(staticFilesPath));
  }

  registerSocketController(socketController) {
    this.io.on('connection', (socket) => {
      socketController.registerConnection(socket);
    });
  }

  start() {
    this.server.listen(this.port, () => {
      console.log(`[ExpressServer] Virtual Office Server running on port ${this.port}`);
      console.log(`[ExpressServer] Local Address: http://localhost:${this.port}`);
    });
  }
}

module.exports = ExpressServer;
