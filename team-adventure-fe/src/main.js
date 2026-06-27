import { RUNTIME } from './config/runtime.js';
import { OfficeScene } from './game/OfficeScene.js';
import { OfficeSocket } from './realtime/officeSocket.js';
import { OfficeStore } from './state/officeStore.js';
import { OfficeUi } from './ui/officeUi.js';

const store = new OfficeStore();
const socket = new OfficeSocket(RUNTIME.wsUrl);
const ui = new OfficeUi(store, socket);

let game = null;
let localProfile = null;

socket.on('connection-change', state => ui.setConnectionState(state));
socket.on('office-state', state => {
  store.hydrate(state);
  ui.enterOffice(state.sharedNote);
  bootGame();
});
socket.on('new-player', player => store.upsertPlayer(player));
socket.on('player-moved', player => store.upsertPlayer(player));
socket.on('player-status-changed', player => store.upsertPlayer(player));
socket.on('player-media-changed', player => store.upsertPlayer(player));
socket.on('player-zone-changed', player => store.upsertPlayer(player));
socket.on('player-disconnected', payload => store.removePlayer(payload.id));
socket.on('note-updated', payload => store.updateNote(payload.text));

ui.bind({
  onJoin(profile) {
    localProfile = profile;
    socket.send('join-office', profile);
  }
});

socket.connect();

function bootGame() {
  if (game) {
    return;
  }

  const scene = new OfficeScene(store, socket, ui, localProfile);
  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game-root',
    width: 960,
    height: 640,
    backgroundColor: '#f1f5f9',
    physics: {
      default: 'arcade',
      arcade: { gravity: { y: 0 }, debug: false }
    },
    scene
  });
}
