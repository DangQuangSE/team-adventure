// Domain Entity: Player
class Player {
  constructor({ id, name, x, y, direction, status, isMuted, isCamOff, avatarStyle, zoneId }) {
    this.id = id;
    this.name = name || `Guest_${id.slice(0, 4)}`;
    this.x = x !== undefined ? x : 400;
    this.y = y !== undefined ? y : 350;
    this.direction = direction || 'down';
    this.status = status || 'working'; // 'working' | 'meeting' | 'away'
    this.isMuted = isMuted !== undefined ? isMuted : false;
    this.isCamOff = isCamOff !== undefined ? isCamOff : false;
    this.avatarStyle = avatarStyle || 'dev-blue';
    this.zoneId = zoneId || null;
  }

  updatePosition(x, y, direction) {
    this.x = x;
    this.y = y;
    if (direction) this.direction = direction;
  }

  updateStatus(status) {
    this.status = status;
  }

  updateMedia(isMuted, isCamOff) {
    if (isMuted !== undefined) this.isMuted = isMuted;
    if (isCamOff !== undefined) this.isCamOff = isCamOff;
  }

  updateZone(zoneId) {
    this.zoneId = zoneId;
  }
}

module.exports = Player;
