export class OfficeUi {
  constructor(store, socket) {
    this.store = store;
    this.socket = socket;
    this.noteDebounce = null;
    this.elements = {
      joinScreen: document.getElementById('join-screen'),
      officeScreen: document.getElementById('office-screen'),
      joinForm: document.getElementById('join-form'),
      displayName: document.getElementById('display-name'),
      connectionState: document.getElementById('connection-state'),
      peopleList: document.getElementById('people-list'),
      sharedNote: document.getElementById('shared-note'),
      interactionTip: document.getElementById('interaction-tip'),
      roomChip: document.getElementById('room-chip'),
      muteButton: document.getElementById('mute-button'),
      cameraButton: document.getElementById('camera-button')
    };
  }

  bind({ onJoin, onToggleMic }) {
    document.querySelectorAll('.avatar-option').forEach(button => {
      button.addEventListener('click', () => {
        document.querySelectorAll('.avatar-option').forEach(item => item.classList.remove('active'));
        button.classList.add('active');
      });
    });

    this.elements.joinForm.addEventListener('submit', event => {
      event.preventDefault();
      const activeAvatar = document.querySelector('.avatar-option.active');
      onJoin({
        name: this.elements.displayName.value.trim() || 'Guest',
        avatarStyle: activeAvatar.dataset.avatar
      });
    });

    document.getElementById('focus-button').addEventListener('click', () => this.changeStatus('focusing'));
    document.getElementById('meeting-button').addEventListener('click', () => this.changeStatus('meeting'));
    document.getElementById('away-button').addEventListener('click', () => this.changeStatus('away'));

    this.elements.muteButton.addEventListener('click', () => onToggleMic());
    this.elements.cameraButton.addEventListener('click', () => this.toggleMedia('cameraOff'));

    this.elements.sharedNote.addEventListener('input', () => {
      this.syncNote(this.elements.sharedNote.value);
    });

    document.getElementById('board-close').addEventListener('click', () => this.closeBoard());
    document.getElementById('board-note').addEventListener('input', event => {
      this.elements.sharedNote.value = event.target.value;
      this.syncNote(event.target.value);
    });

    this.store.addEventListener('change', () => this.renderPeople());
    this.store.addEventListener('note-change', event => {
      if (document.activeElement !== this.elements.sharedNote) {
        this.elements.sharedNote.value = event.detail;
      }
      if (document.activeElement !== document.getElementById('board-note')) {
        document.getElementById('board-note').value = event.detail;
      }
    });
  }

  enterOffice(note) {
    this.elements.joinScreen.classList.add('hidden');
    this.elements.officeScreen.classList.remove('hidden');
    this.elements.sharedNote.value = note || '';
    document.getElementById('board-note').value = note || '';
  }

  setConnectionState(state) {
    this.elements.connectionState.textContent = state;
    this.elements.connectionState.dataset.state = state;
  }

  setInteraction(object) {
    this.elements.interactionTip.classList.toggle('hidden', !object);
    this.elements.interactionTip.textContent = object ? `Press E - ${object.name}` : '';
  }

  setRoom(room) {
    this.elements.roomChip.classList.toggle('hidden', !room);
    this.elements.roomChip.textContent = room ? room.name : '';
  }

  showToast(message) {
    this.elements.interactionTip.textContent = message;
    this.elements.interactionTip.classList.remove('hidden');
  }

  openBoard(object) {
    document.getElementById('board-title').textContent = object.name;
    document.getElementById('board-note').value = this.elements.sharedNote.value;
    document.getElementById('board-modal').classList.remove('hidden');
    document.getElementById('board-note').focus();
  }

  closeBoard() {
    document.getElementById('board-modal').classList.add('hidden');
  }

  syncNote(text) {
    clearTimeout(this.noteDebounce);
    this.noteDebounce = setTimeout(() => {
      this.socket.send('edit-note', { text });
    }, 350);
  }

  setMicState(muted) {
    this.elements.muteButton.textContent = muted ? 'Mic Off' : 'Mic On';
    this.elements.muteButton.classList.toggle('danger', muted);
  }

  setVoiceState(activeCount) {
    const label = document.getElementById('voice-state');
    label.textContent = activeCount > 0
      ? `${activeCount} nearby voice connection${activeCount > 1 ? 's' : ''}`
      : 'No nearby voice';
  }

  changeStatus(status) {
    this.socket.send('change-status', { status });
  }

  toggleMedia(key) {
    const self = this.store.self();
    const muted = key === 'muted' ? !self?.muted : Boolean(self?.muted);
    const cameraOff = key === 'cameraOff' ? !self?.cameraOff : Boolean(self?.cameraOff);
    this.socket.send('change-media', { muted, cameraOff });
    this.elements.muteButton.textContent = muted ? 'Mic Off' : 'Mic On';
    this.elements.cameraButton.textContent = cameraOff ? 'Cam Off' : 'Cam On';
  }

  renderPeople() {
    this.elements.peopleList.replaceChildren();
    for (const player of this.store.allPlayers()) {
      const row = document.createElement('article');
      row.className = 'person-row';
      row.innerHTML = `
        <span class="avatar-dot ${player.avatarStyle}"></span>
        <div>
          <strong>${escapeHtml(player.name)}</strong>
          <small>${escapeHtml(player.status)}${player.zoneId ? ` / ${escapeHtml(player.zoneId)}` : ''}</small>
        </div>
      `;
      this.elements.peopleList.append(row);
    }
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
