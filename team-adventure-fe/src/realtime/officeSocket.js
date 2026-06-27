export class OfficeSocket {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.listeners = new Map();
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.addEventListener('open', () => this.emitLocal('connection-change', 'connected'));
    this.ws.addEventListener('close', () => this.emitLocal('connection-change', 'disconnected'));
    this.ws.addEventListener('error', () => this.emitLocal('connection-change', 'error'));
    this.ws.addEventListener('message', event => {
      const message = JSON.parse(event.data);
      this.emitLocal(message.type, message.payload);
    });
  }

  on(type, listener) {
    const listeners = this.listeners.get(type) || [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  send(type, payload = {}) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }
    this.ws.send(JSON.stringify({ type, payload }));
  }

  emitLocal(type, payload) {
    for (const listener of this.listeners.get(type) || []) {
      listener(payload);
    }
  }
}
