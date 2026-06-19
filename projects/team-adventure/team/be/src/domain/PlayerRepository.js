// Domain Repository: In-Memory Player Repository
class PlayerRepository {
  constructor() {
    this.players = {};
  }

  save(player) {
    this.players[player.id] = player;
    return player;
  }

  findById(id) {
    return this.players[id] || null;
  }

  findAll() {
    return { ...this.players };
  }

  delete(id) {
    if (this.players[id]) {
      const player = this.players[id];
      delete this.players[id];
      return player;
    }
    return null;
  }
}

module.exports = PlayerRepository;
