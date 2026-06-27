export class OfficeStore extends EventTarget {
  constructor() {
    super();
    this.selfId = null;
    this.players = new Map();
    this.note = '';
  }

  hydrate(state) {
    this.selfId = state.selfId;
    this.players = new Map(state.players.map(player => [player.id, player]));
    this.note = state.sharedNote || '';
    this.dispatch();
  }

  upsertPlayer(player) {
    this.players.set(player.id, player);
    this.dispatch();
  }

  removePlayer(id) {
    this.players.delete(id);
    this.dispatch();
  }

  updateNote(text) {
    this.note = text;
    this.dispatchEvent(new CustomEvent('note-change', { detail: text }));
  }

  allPlayers() {
    return Array.from(this.players.values());
  }

  self() {
    return this.players.get(this.selfId);
  }

  dispatch() {
    this.dispatchEvent(new Event('change'));
  }
}
