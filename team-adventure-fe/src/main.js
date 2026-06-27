import { RUNTIME } from './config/runtime.js';
import { OfficeScene } from './game/OfficeScene.js';
import { OfficeSocket } from './realtime/officeSocket.js';
import { ProximityVoice } from './realtime/proximityVoice.js';
import { OfficeStore } from './state/officeStore.js';
import { OfficeUi } from './ui/officeUi.js';

const store = new OfficeStore();
const socket = new OfficeSocket(RUNTIME.wsUrl);
const ui = new OfficeUi(store, socket);

let game = null;
let localProfile = null;
let officeScene = null;
const voice = new ProximityVoice(store, socket, ui, () => officeScene?.getLocalPresence());
voice.bindSocketEvents();

socket.on('connection-change', state => ui.setConnectionState(state));
socket.on('office-state', state => {
  store.hydrate(state);
  ui.enterOffice(state.sharedNote);
  bootGame();
  voice.start();
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
  },
  onToggleMic: () => voice.toggleMuted()
});

socket.connect();

function bootGame() {
  if (game) {
    return;
  }

  const scene = new OfficeScene(store, socket, ui, localProfile);
  officeScene = scene;
  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game-root',
    width: 1100,
    height: 720,
    backgroundColor: '#f1f5f9',
    physics: {
      default: 'arcade',
      arcade: { gravity: { y: 0 }, debug: false }
    },
    scene
  });
}
