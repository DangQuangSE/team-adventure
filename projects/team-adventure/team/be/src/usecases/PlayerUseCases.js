// Application Use Cases: Player & Notepad operations
const Player = require('../domain/Player');

class PlayerUseCases {
  constructor(playerRepository) {
    this.playerRepository = playerRepository;
    this.sharedNote = `📝 TEAM COLLABORATIVE WHITEBOARD & NOTES

Welcome to our Virtual Office!
Feel free to drop notes, coordinate schedules, or brainstorm ideas here. Everything is synced in real-time.

---
🎯 Today's Goals:
1. Finish the Phaser 3 frontend.
2. Complete WebRTC proximity audio/video integration.
3. Test private zones with the team.

⚡ Pro-tip: Walk close to other players to start a voice/video call!`;
  }

  joinOffice(id, { name, avatarStyle }) {
    // Spawn point inside the lobby/office entrance with random offset
    const x = 400 + (Math.random() * 40 - 20);
    const y = 350 + (Math.random() * 40 - 20);
    const player = new Player({
      id,
      name,
      x,
      y,
      avatarStyle,
      status: 'working',
      isMuted: false,
      isCamOff: false,
      zoneId: null
    });
    return this.playerRepository.save(player);
  }

  movePlayer(id, { x, y, direction }) {
    const player = this.playerRepository.findById(id);
    if (player) {
      player.updatePosition(x, y, direction);
      this.playerRepository.save(player);
      return player;
    }
    return null;
  }

  changeStatus(id, status) {
    const player = this.playerRepository.findById(id);
    if (player) {
      player.updateStatus(status);
      this.playerRepository.save(player);
      return player;
    }
    return null;
  }

  changeMedia(id, { isMuted, isCamOff }) {
    const player = this.playerRepository.findById(id);
    if (player) {
      player.updateMedia(isMuted, isCamOff);
      this.playerRepository.save(player);
      return player;
    }
    return null;
  }

  changeZone(id, zoneId) {
    const player = this.playerRepository.findById(id);
    if (player) {
      player.updateZone(zoneId);
      this.playerRepository.save(player);
      return player;
    }
    return null;
  }

  getSharedNote() {
    return this.sharedNote;
  }

  updateSharedNote(text) {
    this.sharedNote = text;
    return this.sharedNote;
  }

  getAllPlayers() {
    return this.playerRepository.findAll();
  }

  disconnectPlayer(id) {
    return this.playerRepository.delete(id);
  }
}

module.exports = PlayerUseCases;
