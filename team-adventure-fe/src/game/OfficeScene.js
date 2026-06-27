import { DESKS, OBJECTS, ROOMS, WORLD } from '../config/officeMap.js';
import { createTextures } from './textures.js';

export class OfficeScene extends Phaser.Scene {
  constructor(store, socket, ui, localProfile) {
    super('OfficeScene');
    this.store = store;
    this.socket = socket;
    this.ui = ui;
    this.localProfile = localProfile;
    this.remoteSprites = new Map();
    this.lastMovementAt = 0;
    this.currentZoneId = null;
    this.nearbyObject = null;
  }

  preload() {
    createTextures(this);
  }

  create() {
    this.physics.world.setBounds(0, 0, WORLD.width, WORLD.height);
    this.cameras.main.setBounds(0, 0, WORLD.width, WORLD.height);

    this.add.tileSprite(WORLD.width / 2, WORLD.height / 2, WORLD.width, WORLD.height, 'floor');
    this.drawRooms();
    this.drawObjects();

    this.obstacles = this.physics.add.staticGroup();
    DESKS.forEach(desk => this.obstacles.create(desk.x, desk.y, 'desk'));

    const self = this.store.self();
    this.player = this.physics.add.sprite(
      self?.x || WORLD.spawn.x,
      self?.y || WORLD.spawn.y,
      this.localProfile.avatarStyle
    );
    this.player.setCollideWorldBounds(true);
    this.player.setSize(20, 16).setOffset(6, 16);
    this.physics.add.collider(this.player, this.obstacles);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    this.nameTag = this.add.text(this.player.x, this.player.y - 25, this.localProfile.name, {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#111827',
      backgroundColor: '#ffffff',
      padding: { x: 6, y: 3 }
    }).setOrigin(0.5);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,E');

    this.store.addEventListener('change', () => this.syncRemotePlayers());
  }

  update(time) {
    if (!this.player) {
      return;
    }

    const speed = 165;
    let vx = 0;
    let vy = 0;
    let direction = 'down';

    if (this.cursors.left.isDown || this.keys.A.isDown) {
      vx = -speed;
      direction = 'left';
    } else if (this.cursors.right.isDown || this.keys.D.isDown) {
      vx = speed;
      direction = 'right';
    }

    if (this.cursors.up.isDown || this.keys.W.isDown) {
      vy = -speed;
      direction = 'up';
    } else if (this.cursors.down.isDown || this.keys.S.isDown) {
      vy = speed;
      direction = 'down';
    }

    this.player.setVelocity(vx, vy);
    this.nameTag.setPosition(this.player.x, this.player.y - 25);
    this.detectZone();
    this.detectInteraction();

    if ((vx !== 0 || vy !== 0) && time - this.lastMovementAt > 50) {
      this.lastMovementAt = time;
      this.socket.send('player-movement', {
        x: Math.round(this.player.x),
        y: Math.round(this.player.y),
        direction
      });
    }
  }

  drawRooms() {
    for (const room of ROOMS) {
      this.add.tileSprite(room.x + room.width / 2, room.y + room.height / 2, room.width, room.height, 'room-floor');
      const graphics = this.add.graphics();
      graphics.lineStyle(room.type === 'private' ? 4 : 2, room.color, 0.9);
      graphics.strokeRoundedRect(room.x, room.y, room.width, room.height, 8);
      this.add.text(room.x + 14, room.y + 12, room.name, {
        fontFamily: 'Arial',
        fontSize: '13px',
        color: '#111827',
        backgroundColor: '#f8fafc',
        padding: { x: 8, y: 4 }
      });
    }
  }

  drawObjects() {
    for (const object of OBJECTS) {
      const texture = object.kind === 'lounge' ? 'coffee' : 'whiteboard';
      this.add.image(object.x, object.y, texture);
      this.add.text(object.x, object.y - 38, object.name, {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#334155'
      }).setOrigin(0.5);
    }
  }

  detectZone() {
    const zone = ROOMS.find(room =>
      this.player.x >= room.x &&
      this.player.x <= room.x + room.width &&
      this.player.y >= room.y &&
      this.player.y <= room.y + room.height
    );
    const nextZoneId = zone?.id || null;

    if (nextZoneId !== this.currentZoneId) {
      this.currentZoneId = nextZoneId;
      this.socket.send('change-zone', { zoneId: nextZoneId });
      this.ui.setRoom(zone);
    }
  }

  detectInteraction() {
    const nearby = OBJECTS.find(object => Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      object.x,
      object.y
    ) < 70);

    this.ui.setInteraction(nearby);
    if (nearby && Phaser.Input.Keyboard.JustDown(this.keys.E)) {
      this.ui.openBoard(nearby);
    }
  }

  getLocalPresence() {
    if (!this.player) {
      return null;
    }
    return {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y),
      zoneId: this.currentZoneId
    };
  }

  syncRemotePlayers() {
    const selfId = this.store.selfId;
    const seen = new Set();

    for (const player of this.store.allPlayers()) {
      if (player.id === selfId) {
        continue;
      }
      seen.add(player.id);

      let sprite = this.remoteSprites.get(player.id);
      if (!sprite) {
        sprite = this.physics.add.sprite(player.x, player.y, player.avatarStyle);
        sprite.nameTag = this.add.text(player.x, player.y - 25, player.name, {
          fontFamily: 'Arial',
          fontSize: '11px',
          color: '#f8fafc',
          backgroundColor: '#111827',
          padding: { x: 6, y: 3 }
        }).setOrigin(0.5);
        this.remoteSprites.set(player.id, sprite);
      }

      this.tweens.add({ targets: sprite, x: player.x, y: player.y, duration: 70, ease: 'Linear' });
      sprite.nameTag.setText(`${player.name} - ${player.status}`);
      sprite.nameTag.setPosition(player.x, player.y - 25);
      sprite.setTexture(player.avatarStyle);
    }

    for (const [id, sprite] of this.remoteSprites.entries()) {
      if (!seen.has(id)) {
        sprite.nameTag.destroy();
        sprite.destroy();
        this.remoteSprites.delete(id);
      }
    }
  }
}
