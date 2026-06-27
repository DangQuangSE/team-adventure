import { DESKS, OBJECTS, ROOMS, WORLD } from '../config/officeMap.js';
import { AVATAR_ASSETS, createTextures, loadAvatarAssets } from './textures.js';

const NAME_TAG_OFFSET = 88;
const BASE_AVATAR_SCALE = 0.24;

export class OfficeScene extends Phaser.Scene {
  constructor(store, socket, ui, localProfile) {
    super('OfficeScene');
    this.store = store;
    this.socket = socket;
    this.ui = ui;
    this.localProfile = localProfile;
    this.remoteSprites = new Map();
    this.blinkOverlays = new Map();
    this.lastMovementAt = 0;
    this.currentZoneId = null;
    this.nearbyObject = null;
  }

  preload() {
    this.load.image('office-background', WORLD.background);
    loadAvatarAssets(this);
    createTextures(this);
  }

  create() {
    this.physics.world.setBounds(0, 0, WORLD.width, WORLD.height);
    this.cameras.main.setBounds(0, 0, WORLD.width, WORLD.height);

    this.add.image(WORLD.width / 2, WORLD.height / 2, 'office-background');
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
    this.configureAvatarSprite(this.player);
    this.createBlinkOverlay(this.player, 'local');
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    this.nameTag = this.add.text(this.player.x, this.player.y - NAME_TAG_OFFSET, this.localProfile.name, {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#111827',
      backgroundColor: '#ffffff',
      padding: { x: 6, y: 3 }
    }).setOrigin(0.5);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,E');
    this.createAvatarAnimations();
    this.playIdle(this.player, this.localProfile.avatarStyle);

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
    this.applyLocalMotionVisual(vx, vy, time);
    this.updateBlinkOverlay(this.player);
    this.updateRemoteIdleVisuals();
    this.nameTag.setPosition(this.player.x, this.player.y - NAME_TAG_OFFSET);
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
      const graphics = this.add.graphics();
      graphics.lineStyle(room.type === 'private' ? 3 : 2, room.color, 0.35);
      graphics.fillStyle(room.color, 0.035);
      graphics.fillRoundedRect(room.x, room.y, room.width, room.height, 8);
      graphics.strokeRoundedRect(room.x, room.y, room.width, room.height, 8);
      this.add.text(room.x + 12, room.y + 10, room.name, {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#f8fafc',
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        padding: { x: 7, y: 3 }
      });
    }
  }

  createAvatarAnimations() {
    Object.keys(AVATAR_ASSETS).forEach(key => {
      if (this.anims.exists(`${key}-idle`)) {
        return;
      }
      this.anims.create({
        key: `${key}-idle`,
        frames: this.anims.generateFrameNumbers(key, { start: 0, end: 3 }),
        frameRate: 5,
        repeat: -1,
        yoyo: true
      });
    });
  }

  configureAvatarSprite(sprite) {
    sprite.setScale(BASE_AVATAR_SCALE);
    sprite.setOrigin(0.5, 0.78);
    sprite.setSize(44, 38);
    sprite.setOffset(54, 292);
  }

  playIdle(sprite, avatarStyle) {
    sprite.play(`${avatarStyle}-idle`, true);
  }

  applyLocalMotionVisual(vx, vy, time) {
    const isMoving = vx !== 0 || vy !== 0;
    this.player.setFlipX(vx < 0);
    const idleBob = Math.sin(time / 360) * 0.004;
    const moveSway = isMoving ? Math.sin(time / 85) : 0;
    this.player.setAngle(moveSway * 2.5);
    this.player.setScale(BASE_AVATAR_SCALE + Math.abs(moveSway) * 0.008 + idleBob);
  }

  createBlinkOverlay(sprite, id) {
    const blink = this.add.graphics();
    blink.setDepth(20);
    blink.visible = false;
    blink.nextBlinkAt = this.time.now + Phaser.Math.Between(1200, 3600);
    blink.hideAt = 0;
    this.blinkOverlays.set(id, blink);
    sprite.blinkOverlayId = id;
  }

  updateBlinkOverlay(sprite) {
    const blink = this.blinkOverlays.get(sprite.blinkOverlayId);
    if (!blink) {
      return;
    }

    const now = this.time.now;
    if (!blink.visible && now >= blink.nextBlinkAt) {
      blink.visible = true;
      blink.hideAt = now + Phaser.Math.Between(90, 140);
    } else if (blink.visible && now >= blink.hideAt) {
      blink.visible = false;
      blink.nextBlinkAt = now + Phaser.Math.Between(1800, 5200);
    }

    blink.clear();
    if (!blink.visible) {
      return;
    }

    const x = sprite.x + (sprite.flipX ? -1 : 1) * 1;
    const y = sprite.y - 37;
    blink.fillStyle(0x111827, 0.95);
    blink.fillRoundedRect(x - 8, y, 6, 2, 1);
    blink.fillRoundedRect(x + 2, y, 6, 2, 1);
  }

  applyRemoteMotionVisual(sprite, player) {
    const previous = sprite.previousPosition || { x: player.x, y: player.y };
    const isMoving = previous.x !== player.x || previous.y !== player.y;
    const phase = this.time.now / (isMoving ? 95 : 360);
    const sway = isMoving ? Math.sin(phase) : 0;
    const idleBob = Math.sin(this.time.now / 360) * 0.004;

    sprite.setAngle(sway * 2.2);
    sprite.setScale(BASE_AVATAR_SCALE + Math.abs(sway) * 0.007 + idleBob);
    sprite.previousPosition = { x: player.x, y: player.y };
  }

  updateRemoteIdleVisuals() {
    for (const sprite of this.remoteSprites.values()) {
      this.updateBlinkOverlay(sprite);
    }
  }

  drawObjects() {
    for (const object of OBJECTS) {
      const marker = this.add.graphics();
      marker.lineStyle(2, 0xf8fafc, 0.55);
      marker.strokeRoundedRect(
        object.x - object.width / 2,
        object.y - object.height / 2,
        object.width,
        object.height,
        8
      );
      this.add.text(object.x, object.y - object.height / 2 - 14, object.name, {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#f8fafc',
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        padding: { x: 7, y: 3 }
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
        this.configureAvatarSprite(sprite);
        this.playIdle(sprite, player.avatarStyle);
        this.createBlinkOverlay(sprite, player.id);
        sprite.nameTag = this.add.text(player.x, player.y - NAME_TAG_OFFSET, player.name, {
          fontFamily: 'Arial',
          fontSize: '11px',
          color: '#f8fafc',
          backgroundColor: '#111827',
          padding: { x: 6, y: 3 }
        }).setOrigin(0.5);
        this.remoteSprites.set(player.id, sprite);
      }

      this.tweens.add({ targets: sprite, x: player.x, y: player.y, duration: 70, ease: 'Linear' });
      this.applyRemoteMotionVisual(sprite, player);
      this.updateBlinkOverlay(sprite);
      sprite.nameTag.setText(`${player.name} - ${player.status}`);
      sprite.nameTag.setPosition(player.x, player.y - NAME_TAG_OFFSET);
      if (sprite.texture.key !== player.avatarStyle) {
        sprite.setTexture(player.avatarStyle);
        this.playIdle(sprite, player.avatarStyle);
      }
      sprite.setFlipX(player.direction === 'left');
    }

    for (const [id, sprite] of this.remoteSprites.entries()) {
      if (!seen.has(id)) {
        sprite.nameTag.destroy();
        this.blinkOverlays.get(id)?.destroy();
        this.blinkOverlays.delete(id);
        sprite.destroy();
        this.remoteSprites.delete(id);
      }
    }
  }
}
