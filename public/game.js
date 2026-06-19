// ==========================================
// CLIENT GAME ENGINE & WEBRTC CONTROLLER
// ==========================================

const socket = io();

// Application State
let localStream = null;
let myPlayerId = null;
let currentPlayers = {};
let activeZoneId = null;
let currentNearbyCount = 0;
let isMuted = false;
let isCamOff = false;
let myName = '';
let myAvatarStyle = 'dev-blue';

// WebRTC Peer Connections Dictionary
// Format: { [peerId]: { pc, stream, cardElement, videoElement } }
const peerConnections = {};

// Interactive Objects List
const INTERACTIVE_OBJECTS = [
  {
    id: 'whiteboard',
    name: 'Collaborative Whiteboard',
    x: 480,
    y: 180,
    width: 64,
    height: 32,
    color: 0xffffff,
    url: 'https://excalidraw.com/',
    icon: 'fa-chalkboard-user'
  },
  {
    id: 'lofi_tv',
    name: 'Cozy YouTube Lounge',
    x: 800,
    y: 650,
    width: 64,
    height: 48,
    color: 0xff0000,
    url: 'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=1',
    icon: 'fa-tv'
  }
];

// Private Zone Definitions (bounding boxes)
const PRIVATE_ZONES = [
  {
    id: 'meeting_room_1',
    name: 'Accounting & Finance Meeting Room',
    x: 60,
    y: 60,
    width: 320,
    height: 240,
    color: 0x0ea5e9, // light blue neon border
    carpetColor: 0x075985
  },
  {
    id: 'meeting_room_2',
    name: 'CEO Office / VIP Boardroom',
    x: 60,
    y: 480,
    width: 320,
    height: 240,
    color: 0xa855f7, // purple neon border
    carpetColor: 0x581c87
  }
];

// ==========================================
// 1. TEXTURE CREATOR (PROCEDURAL ART)
// ==========================================
// We draw pixel art assets dynamically using canvas so there are zero asset load failures.
function generateProceduralTextures(scene) {
  // A. Create Map Tiles
  // Floor (Wood texture)
  let floorCanvas = scene.textures.createCanvas('tile-floor', 32, 32);
  let ctx = floorCanvas.context;
  ctx.fillStyle = '#1e1b4b'; // dark wood background
  ctx.fillRect(0, 0, 32, 32);
  ctx.fillStyle = '#312e81'; // wood grain lines
  ctx.fillRect(0, 0, 30, 30);
  ctx.fillStyle = '#4338ca'; // grain detail
  ctx.fillRect(4, 8, 22, 4);
  ctx.fillRect(8, 20, 18, 4);
  floorCanvas.refresh();

  // Carpet (Meeting room texture)
  let carpet1Canvas = scene.textures.createCanvas('tile-carpet-1', 32, 32);
  ctx = carpet1Canvas.context;
  ctx.fillStyle = '#0f172a'; // dark slate
  ctx.fillRect(0, 0, 32, 32);
  ctx.fillStyle = '#1e293b'; // checks pattern
  ctx.fillRect(0, 0, 16, 16);
  ctx.fillRect(16, 16, 16, 16);
  carpet1Canvas.refresh();

  let carpet2Canvas = scene.textures.createCanvas('tile-carpet-2', 32, 32);
  ctx = carpet2Canvas.context;
  ctx.fillStyle = '#311042'; // deep burgundy
  ctx.fillRect(0, 0, 32, 32);
  ctx.fillStyle = '#4a1268';
  ctx.fillRect(0, 0, 16, 16);
  ctx.fillRect(16, 16, 16, 16);
  carpet2Canvas.refresh();

  // Wall Tile (Concrete)
  let wallCanvas = scene.textures.createCanvas('tile-wall', 32, 32);
  ctx = wallCanvas.context;
  ctx.fillStyle = '#0f172a'; // wall core
  ctx.fillRect(0, 0, 32, 32);
  ctx.fillStyle = '#334155'; // brick highlights
  ctx.fillRect(0, 0, 30, 28);
  ctx.fillStyle = '#475569'; // light texture
  ctx.fillRect(2, 2, 26, 10);
  ctx.fillRect(2, 14, 26, 10);
  wallCanvas.refresh();

  // B. Draw Interactive Objects
  // Whiteboard
  let boardCanvas = scene.textures.createCanvas('obj-whiteboard', 64, 32);
  ctx = boardCanvas.context;
  ctx.fillStyle = '#475569'; // frame
  ctx.fillRect(0, 0, 64, 32);
  ctx.fillStyle = '#f8fafc'; // board face
  ctx.fillRect(2, 2, 60, 28);
  ctx.fillStyle = '#3b82f6'; // whiteboard sketches
  ctx.fillRect(8, 6, 16, 2);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(10, 12, 8, 4);
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(30, 8, 20, 12);
  boardCanvas.refresh();

  // Lounge TV
  let tvCanvas = scene.textures.createCanvas('obj-tv', 64, 48);
  ctx = tvCanvas.context;
  ctx.fillStyle = '#1e293b'; // base stand
  ctx.fillRect(20, 40, 24, 8);
  ctx.fillStyle = '#0f172a'; // monitor frame
  ctx.fillRect(4, 0, 56, 40);
  ctx.fillStyle = '#1e1b4b'; // glowing screen
  ctx.fillRect(8, 4, 48, 32);
  // draw retro static
  ctx.fillStyle = '#6366f1';
  ctx.fillRect(14, 10, 12, 12);
  ctx.fillStyle = '#f43f5e';
  ctx.fillRect(30, 14, 14, 14);
  tvCanvas.refresh();

  // Desk with Computer
  let deskCanvas = scene.textures.createCanvas('obj-desk', 64, 48);
  ctx = deskCanvas.context;
  ctx.fillStyle = '#451a03'; // table brown
  ctx.fillRect(0, 12, 64, 36);
  ctx.fillStyle = '#78350f'; // desktop border
  ctx.fillRect(0, 12, 64, 4);
  ctx.fillStyle = '#111827'; // computer stand
  ctx.fillRect(28, 28, 8, 8);
  ctx.fillStyle = '#1f2937'; // monitor bezel
  ctx.fillRect(16, 16, 32, 14);
  ctx.fillStyle = '#0284c7'; // blue screen
  ctx.fillRect(18, 18, 28, 10);
  ctx.fillStyle = '#e2e8f0'; // keyboard
  ctx.fillRect(20, 36, 24, 4);
  deskCanvas.refresh();

  // Plant Pot
  let plantCanvas = scene.textures.createCanvas('obj-plant', 32, 32);
  ctx = plantCanvas.context;
  ctx.fillStyle = '#78350f'; // pot
  ctx.fillRect(8, 20, 16, 12);
  ctx.fillStyle = '#15803d'; // leaves
  ctx.beginPath();
  ctx.arc(16, 12, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#166534';
  ctx.beginPath();
  ctx.arc(12, 10, 6, 0, Math.PI * 2);
  ctx.arc(20, 14, 6, 0, Math.PI * 2);
  ctx.fill();
  plantCanvas.refresh();

  // C. Create Animated Avatar Sprite Sheets
  // 3 frames (walk left, idle, walk right) x 4 directions (down, left, right, up)
  // Overall Dimensions: 96 width x 128 height
  const avatarColors = {
    'dev-blue': { shirt: '#3b82f6', pants: '#ffffff', hair: '#1e293b' },
    'des-purple': { shirt: '#a855f7', pants: '#fef08a', hair: '#e11d48' },
    'mgr-orange': { shirt: '#f97316', pants: '#111827', hair: '#d97706' },
    'qa-green': { shirt: '#22c55e', pants: '#4b5563', hair: '#0284c7' }
  };

  Object.entries(avatarColors).forEach(([key, color]) => {
    let sheet = scene.textures.createCanvas(key, 96, 128);
    let sCtx = sheet.context;
    
    // Draw grid of 3x4 sprites (each sprite size is 32x32)
    // cols: [0] = Left Foot Walk, [1] = Stand Idle, [2] = Right Foot Walk
    // rows: [0] = Down, [1] = Left, [2] = Right, [3] = Up
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 3; col++) {
        let x = col * 32;
        let y = row * 32;

        // Draw Head (Circle)
        sCtx.fillStyle = '#ffedd5'; // skin tone
        sCtx.beginPath();
        sCtx.arc(x + 16, y + 10, 6, 0, Math.PI * 2);
        sCtx.fill();

        // Draw Hair (Hat)
        sCtx.fillStyle = color.hair;
        sCtx.beginPath();
        sCtx.arc(x + 16, y + 7, 5, Math.PI, 0); // top hair cap
        sCtx.fill();

        // Hair styling / back detail
        sCtx.fillRect(x + 11, y + 6, 10, 4);

        // Eyes (depend on direction)
        sCtx.fillStyle = '#0f172a';
        if (row === 0) { // Down
          sCtx.fillRect(x + 13, y + 10, 2, 2);
          sCtx.fillRect(x + 17, y + 10, 2, 2);
        } else if (row === 1) { // Left
          sCtx.fillRect(x + 11, y + 10, 2, 2);
        } else if (row === 2) { // Right
          sCtx.fillRect(x + 19, y + 10, 2, 2);
        }

        // Draw Body/Shirt (Rect)
        sCtx.fillStyle = color.shirt;
        sCtx.fillRect(x + 10, y + 16, 12, 10);

        // Draw Legs (Walk Cycle offset)
        sCtx.fillStyle = color.pants;
        if (col === 1 || row === 3) { // Standing frame or moving up
          sCtx.fillRect(x + 11, y + 26, 4, 6);
          sCtx.fillRect(x + 17, y + 26, 4, 6);
        } else if (col === 0) { // Left leg forward
          sCtx.fillRect(x + 10, y + 26, 4, 4);
          sCtx.fillRect(x + 12, y + 29, 3, 3); // shoe
          sCtx.fillRect(x + 17, y + 26, 4, 6);
        } else if (col === 2) { // Right leg forward
          sCtx.fillRect(x + 11, y + 26, 4, 6);
          sCtx.fillRect(x + 18, y + 26, 4, 4);
          sCtx.fillRect(x + 17, y + 29, 3, 3); // shoe
        }
      }
    }
    sheet.refresh();

    // Slice into 32x32 frames for animation frames
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 3; c++) {
        const frameIndex = r * 3 + c;
        sheet.add(frameIndex, 0, c * 32, r * 32, 32, 32);
      }
    }
  });
}

// ==========================================
// 2. PHASER 3 GAME ENGINE CLASS
// ==========================================
class OfficeScene extends Phaser.Scene {
  constructor() {
    super('OfficeScene');
  }

  preload() {
    // Generate all game textures procedurally
    generateProceduralTextures(this);
  }

  create() {
    // A. World Setup
    this.physics.world.setBounds(0, 0, 1024, 800);
    this.cameras.main.setBounds(0, 0, 1024, 800);

    // B. Draw Floor Tiles (Wood floor globally)
    for (let tx = 0; tx < 1024; tx += 32) {
      for (let ty = 0; ty < 800; ty += 32) {
        this.add.image(tx + 16, ty + 16, 'tile-floor');
      }
    }

    // C. Render Private Meeting Rooms & carpets
    PRIVATE_ZONES.forEach(zone => {
      // Draw dark carpet inside meeting zone
      const carpetTile = zone.id === 'meeting_room_1' ? 'tile-carpet-1' : 'tile-carpet-2';
      for (let zx = zone.x; zx < zone.x + zone.width; zx += 32) {
        for (let zy = zone.y; zy < zone.y + zone.height; zy += 32) {
          this.add.image(zx + 16, zy + 16, carpetTile);
        }
      }

      // Draw glass neon wall borders
      const graphics = this.add.graphics();
      graphics.lineStyle(3, zone.color, 0.7);
      graphics.strokeRect(zone.x, zone.y, zone.width, zone.height);
      
      // Draw meeting table in center of zone
      const tableX = zone.x + zone.width / 2;
      const tableY = zone.y + zone.height / 2;
      this.drawMeetingTable(tableX, tableY);

      // Room Title Text
      this.add.text(zone.x + 12, zone.y + 12, zone.name.toUpperCase(), {
        fontFamily: 'Space Grotesk',
        fontSize: '11px',
        fontWeight: 'bold',
        fill: '#ffffff',
        backgroundColor: '#09090b',
        padding: { x: 8, y: 4 }
      });
    });

    // D. Office Obstacles (Physics group)
    this.obstacles = this.physics.add.staticGroup();

    // Boundary Outer Walls
    this.drawBoundaryWalls();

    // Spawn desks scattered around
    this.spawnOfficeFurniture();

    // E. Interactive Objects
    this.interactables = [];
    INTERACTIVE_OBJECTS.forEach(obj => {
      // Add visual sprites
      const key = obj.id === 'whiteboard' ? 'obj-whiteboard' : 'obj-tv';
      const sprite = this.physics.add.staticSprite(obj.x, obj.y, key);
      sprite.setData('objData', obj);
      this.interactables.push(sprite);
      
      // Draw glowing outline
      const glow = this.add.graphics();
      glow.lineStyle(2, obj.color, 0.5);
      glow.strokeRect(obj.x - obj.width/2 - 2, obj.y - obj.height/2 - 2, obj.width + 4, obj.height + 4);

      // Label
      this.add.text(obj.x, obj.y - obj.height/2 - 12, obj.name, {
        fontFamily: 'Plus Jakarta Sans',
        fontSize: '10px',
        fill: '#a1a1aa'
      }).setOrigin(0.5);
    });

    // F. Animations Config
    this.createAvatarAnimations();

    // G. Local Player Spawn & Setup
    this.localPlayer = this.physics.add.sprite(400, 350, myAvatarStyle);
    this.localPlayer.setCollideWorldBounds(true);
    this.localPlayer.setSize(20, 16); // small collision box around feet
    this.localPlayer.setOffset(6, 16);
    this.physics.add.collider(this.localPlayer, this.obstacles);

    // Camera follow player
    this.cameras.main.startFollow(this.localPlayer, true, 0.05, 0.05);

    // Display Name text above head
    this.localPlayerNameText = this.add.text(this.localPlayer.x, this.localPlayer.y - 22, myName || 'You', {
      fontFamily: 'Space Grotesk',
      fontSize: '11px',
      fontWeight: 'bold',
      fill: '#6366f1',
      backgroundColor: 'rgba(0,0,0,0.6)',
      padding: { x: 6, y: 2 }
    }).setOrigin(0.5);

    // H. Other Players Group
    this.otherPlayers = this.add.group();

    // Keyboard controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,E');

    // Notify server we have loaded and are ready to join
    socket.emit('join-office', {
      name: myName,
      avatarStyle: myAvatarStyle
    });

    // Run Proximity Engine ticker (every 200ms)
    this.time.addEvent({
      delay: 200,
      callback: this.runProximityCheck,
      callbackScope: this,
      loop: true
    });
  }

  // Visual helper: Create tables inside rooms
  drawMeetingTable(x, y) {
    // Draw wood block
    const table = this.add.graphics();
    table.fillStyle(0x78350f, 1);
    table.fillRect(x - 60, y - 20, 120, 40);
    // Draw chairs
    table.fillStyle(0x1e293b, 1);
    // top chairs
    table.fillRect(x - 45, y - 32, 16, 10);
    table.fillRect(x - 10, y - 32, 16, 10);
    table.fillRect(x + 25, y - 32, 16, 10);
    // bottom chairs
    table.fillRect(x - 45, y + 22, 16, 10);
    table.fillRect(x - 10, y + 22, 16, 10);
    table.fillRect(x + 25, y + 22, 16, 10);
  }

  drawBoundaryWalls() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0f172a, 1);

    // Border walls rendering & collision
    // Top
    for (let x = 0; x < 1024; x += 32) {
      this.obstacles.create(x + 16, 16, 'tile-wall');
    }
    // Bottom
    for (let x = 0; x < 1024; x += 32) {
      this.obstacles.create(x + 16, 784, 'tile-wall');
    }
    // Left
    for (let y = 32; y < 768; y += 32) {
      this.obstacles.create(16, y + 16, 'tile-wall');
    }
    // Right
    for (let y = 32; y < 768; y += 32) {
      this.obstacles.create(1008, y + 16, 'tile-wall');
    }
  }

  spawnOfficeFurniture() {
    // Coordinates of desks scattered outside private zones
    const desks = [
      { x: 480, y: 350 },
      { x: 620, y: 350 },
      { x: 480, y: 500 },
      { x: 620, y: 500 },
      { x: 800, y: 350 },
      { x: 800, y: 500 }
    ];

    desks.forEach(desk => {
      this.obstacles.create(desk.x, desk.y, 'obj-desk');
    });

    // Spawn some aesthetic plants
    const plants = [
      { x: 380, y: 150 },
      { x: 600, y: 150 },
      { x: 410, y: 720 },
      { x: 920, y: 720 },
      { x: 380, y: 420 },
      { x: 380, y: 580 }
    ];

    plants.forEach(p => {
      this.obstacles.create(p.x, p.y, 'obj-plant');
    });
  }

  createAvatarAnimations() {
    const directions = ['down', 'left', 'right', 'up'];
    const rowIndexes = { 'down': 0, 'left': 1, 'right': 2, 'up': 3 };

    ['dev-blue', 'des-purple', 'mgr-orange', 'qa-green'].forEach(key => {
      directions.forEach(dir => {
        const startFrame = rowIndexes[dir] * 3;
        // Idle Animation
        this.anims.create({
          key: `${key}-idle-${dir}`,
          frames: [{ key: key, frame: startFrame + 1 }],
          frameRate: 10
        });

        // Walk Animation
        this.anims.create({
          key: `${key}-walk-${dir}`,
          frames: this.anims.generateFrameNumbers(key, { start: startFrame, end: startFrame + 2 }),
          frameRate: 8,
          repeat: -1
        });
      });
    });
  }

  update() {
    if (!this.localPlayer) return;

    // A. Movement Controls
    let vx = 0;
    let vy = 0;
    const speed = 150;
    let dir = this.localPlayer.getData('direction') || 'down';
    let isMoving = false;

    if (this.cursors.left.isDown || this.keys.A.isDown) {
      vx = -speed;
      dir = 'left';
      isMoving = true;
    } else if (this.cursors.right.isDown || this.keys.D.isDown) {
      vx = speed;
      dir = 'right';
      isMoving = true;
    }

    if (this.cursors.up.isDown || this.keys.W.isDown) {
      vy = -speed;
      dir = 'up';
      isMoving = true;
    } else if (this.cursors.down.isDown || this.keys.S.isDown) {
      vy = speed;
      dir = 'down';
      isMoving = true;
    }

    // Set movement velocity
    this.localPlayer.setVelocity(vx, vy);
    this.localPlayer.setData('direction', dir);

    // Trigger animations
    if (isMoving) {
      this.localPlayer.anims.play(`${myAvatarStyle}-walk-${dir}`, true);
    } else {
      this.localPlayer.anims.play(`${myAvatarStyle}-idle-${dir}`, true);
    }

    // Name tag follow
    this.localPlayerNameText.setPosition(this.localPlayer.x, this.localPlayer.y - 24);

    // Sync state with server via socket.io (throttled inside socket transmitter)
    this.syncPlayerMovement();

    // B. Check interactive objects overlap/proximity
    let nearObject = null;
    this.interactables.forEach(sprite => {
      const obj = sprite.getData('objData');
      const dist = Phaser.Math.Distance.Between(this.localPlayer.x, this.localPlayer.y, sprite.x, sprite.y);
      if (dist < 60) {
        nearObject = obj;
      }
    });

    const tip = document.getElementById('action-tip');
    if (nearObject) {
      document.getElementById('tip-text').innerText = `Interact with ${nearObject.name}`;
      tip.classList.remove('hidden');

      // Detect "E" key press to trigger overlay
      if (Phaser.Input.Keyboard.JustDown(this.keys.E)) {
        openInteractiveModal(nearObject);
      }
    } else {
      tip.classList.add('hidden');
    }

    // C. Check Private Zones overlapping
    let insideZone = null;
    PRIVATE_ZONES.forEach(zone => {
      if (
        this.localPlayer.x >= zone.x &&
        this.localPlayer.x <= zone.x + zone.width &&
        this.localPlayer.y >= zone.y &&
        this.localPlayer.y <= zone.y + zone.height
      ) {
        insideZone = zone;
      }
    });

    const banner = document.getElementById('room-banner');
    if (insideZone) {
      if (activeZoneId !== insideZone.id) {
        activeZoneId = insideZone.id;
        socket.emit('change-zone', activeZoneId);
        banner.classList.remove('hidden');
        document.getElementById('banner-text').innerText = `${insideZone.name} (Private Call)`;
      }
    } else {
      if (activeZoneId !== null) {
        activeZoneId = null;
        socket.emit('change-zone', null);
        banner.classList.add('hidden');
      }
    }
  }

  // Socket sync throttler
  syncPlayerMovement() {
    const currentX = Math.round(this.localPlayer.x);
    const currentY = Math.round(this.localPlayer.y);
    const currentDir = this.localPlayer.getData('direction');

    // Only send if coordinates actually changed
    if (this.lastSentX !== currentX || this.lastSentY !== currentY || this.lastSentDir !== currentDir) {
      const now = Date.now();
      if (!this.lastEmitTime || now - this.lastEmitTime > 45) { // 45ms throttle
        socket.emit('player-movement', {
          x: currentX,
          y: currentY,
          direction: currentDir
        });
        this.lastSentX = currentX;
        this.lastSentY = currentY;
        this.lastSentDir = currentDir;
        this.lastEmitTime = now;
      }
    }
  }

  // ==========================================
  // 3. PROXIMITY WEBRTC CALL SCHEDULER
  // ==========================================
  // Check distances periodically and trigger peer connection setup/hang-up.
  async runProximityCheck() {
    if (!this.localPlayer || !myPlayerId) return;

    let nearbyCount = 0;

    // Loop through all active socket players
    Object.keys(currentPlayers).forEach(peerId => {
      if (peerId === myPlayerId) return;

      const remoteData = currentPlayers[peerId];
      if (!remoteData) return;

      // Distance calculation
      const dist = Phaser.Math.Distance.Between(
        this.localPlayer.x,
        this.localPlayer.y,
        remoteData.x,
        remoteData.y
      );

      // WebRTC rules logic:
      // Connect if:
      //   1. Both players in the SAME private room zone (and zone is not null)
      //   2. Both players in public space (zoneId = null) AND distance <= 150px
      const localZone = activeZoneId;
      const remoteZone = remoteData.zoneId;

      let shouldConnect = false;

      if (localZone && remoteZone) {
        shouldConnect = (localZone === remoteZone);
      } else if (!localZone && !remoteZone) {
        shouldConnect = (dist <= 150);
      }

      if (shouldConnect) {
        nearbyCount++;
        // If not connected yet, initiate connection
        if (!peerConnections[peerId]) {
          console.log(`[Proximity] Triggering connection to peer: ${peerId}`);
          initiateWebRTCPeer(peerId);
        } else {
          // If already connected, adjust spatial audio based on distance
          adjustSpatialAudio(peerId, dist, localZone !== null);
        }
      } else {
        // If connected but should not be, hang up connection
        if (peerConnections[peerId]) {
          console.log(`[Proximity] Closing connection to peer: ${peerId}`);
          closeWebRTCPeer(peerId);
        }
      }
    });

    if (currentNearbyCount !== nearbyCount) {
      currentNearbyCount = nearbyCount;
      document.getElementById('proximity-count').innerText = `${nearbyCount} Proximity Calls`;
    }
  }
}

// ==========================================
// 4. WEBRTC P2P ENGINE (DIRECT VIA SOCKET.IO)
// ==========================================
const iceConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

// Create local audio/video media streams
async function requestUserMedia() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {
        width: { ideal: 320 },
        height: { ideal: 180 },
        frameRate: { max: 15 }
      }
    });
    
    // Attach stream to local preview video tag
    const localVideo = document.getElementById('local-video');
    localVideo.srcObject = localStream;
    document.getElementById('local-cam-placeholder').classList.add('hidden');
    console.log('[Media] User media stream secured.');
  } catch (err) {
    console.warn('[Media] Access denied or camera/microphone missing. Running in voice-only or spectator.', err);
    // Attempt audio-only fall back
    try {
      localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('[Media] Audio-only fallback media stream secured.');
    } catch (aErr) {
      console.error('[Media] Both camera and mic access failed. Creating dummy media tracks.', aErr);
      
      // Create empty silent audio track and black video track so WebRTC connections don't break
      const canvas = document.createElement('canvas');
      canvas.width = 10;
      canvas.height = 10;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, 10, 10);
      const videoStream = canvas.captureStream(1);
      
      // Silent audio track using Web Audio API
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const dst = oscillator.connect(audioCtx.createMediaStreamDestination());
      oscillator.start();
      
      localStream = new MediaStream([
        videoStream.getVideoTracks()[0],
        dst.stream.getAudioTracks()[0]
      ]);
    }
  }
}

// Init P2P Peer Connection
function initiateWebRTCPeer(peerId) {
  // To prevent double signaling, the client with the lower string ID is the initiator
  const isInitiator = socket.id < peerId;

  if (peerConnections[peerId]) return;

  console.log(`[WebRTC] Building connection with ${peerId} (Initiator: ${isInitiator})`);
  
  const pc = new RTCPeerConnection(iceConfiguration);
  
  // Create state structure
  peerConnections[peerId] = {
    pc: pc,
    stream: null,
    videoElement: null,
    cardElement: null
  };

  // Add our local tracks to the connection
  if (localStream) {
    localStream.getTracks().forEach(track => {
      pc.addTrack(track, localStream);
    });
  }

  // Handle incoming stream tracks
  pc.ontrack = (event) => {
    console.log(`[WebRTC] Received remote stream track from ${peerId}`);
    const remoteStream = event.streams[0];
    
    // Check if we already registered the stream
    if (!peerConnections[peerId].stream) {
      peerConnections[peerId].stream = remoteStream;
      injectRemoteVideoCard(peerId, remoteStream);
    }
  };

  // Handle ICE Candidate generation
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('webrtc-ice-candidate', {
        targetId: peerId,
        candidate: event.candidate
      });
    }
  };

  // Connection State Monitor
  pc.onconnectionstatechange = () => {
    console.log(`[WebRTC] Connection status with ${peerId}: ${pc.connectionState}`);
    if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
      closeWebRTCPeer(peerId);
    }
  };

  // If initiator, send offer
  if (isInitiator) {
    pc.onnegotiationneeded = async () => {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('webrtc-offer', {
          targetId: peerId,
          sdp: pc.localDescription
        });
      } catch (err) {
        console.error('[WebRTC] Offer generation error:', err);
      }
    };
  }
}

// Answer offer SDP
async function handleIncomingOffer(senderId, sdp) {
  console.log(`[WebRTC] Receiving offer SDP from ${senderId}`);
  
  if (!peerConnections[senderId]) {
    initiateWebRTCPeer(senderId);
  }

  const pc = peerConnections[senderId].pc;
  
  try {
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    
    socket.emit('webrtc-answer', {
      targetId: senderId,
      sdp: pc.localDescription
    });
  } catch (err) {
    console.error('[WebRTC] Answer response error:', err);
  }
}

// Handle answer response SDP
async function handleIncomingAnswer(senderId, sdp) {
  console.log(`[WebRTC] Receiving answer SDP from ${senderId}`);
  const peer = peerConnections[senderId];
  if (peer && peer.pc) {
    try {
      await peer.pc.setRemoteDescription(new RTCSessionDescription(sdp));
    } catch (err) {
      console.error('[WebRTC] Set remote answer description error:', err);
    }
  }
}

// Handle incoming ICE Candidate
async function handleIncomingIceCandidate(senderId, candidate) {
  const peer = peerConnections[senderId];
  if (peer && peer.pc) {
    try {
      await peer.pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.warn('[WebRTC] Error adding ICE candidate:', err);
    }
  }
}

// Spatial Audio Adjuster
function adjustSpatialAudio(peerId, distance, isPrivateRoom) {
  const peer = peerConnections[peerId];
  if (!peer || !peer.videoElement) return;

  let volume = 1.0;
  if (!isPrivateRoom) {
    // Spatial drop-off: volume drops from 1.0 (at 0px) to 0.0 (at 150px)
    volume = Math.max(0, Math.min(1, 1 - (distance / 150.0)));
  }

  peer.videoElement.volume = volume;
  
  // Highlight nearby avatar bubble visually or show indicator
  const badge = peer.cardElement.querySelector('.proximity-badge');
  if (badge) {
    if (isPrivateRoom) {
      badge.className = 'proximity-badge spatial';
      badge.innerText = 'Private Room';
    } else {
      badge.className = 'proximity-badge';
      badge.innerText = `Proximity (${Math.round(distance)}px)`;
    }
  }
}

// Close and cleanup peer session
function closeWebRTCPeer(peerId) {
  const peer = peerConnections[peerId];
  if (peer) {
    console.log(`[WebRTC] Cleaning up connection with peer: ${peerId}`);
    
    // Unsubscribe streams
    if (peer.pc) {
      peer.pc.close();
    }
    
    // Remove UI Card
    if (peer.cardElement) {
      peer.cardElement.remove();
    }

    delete peerConnections[peerId];
    socket.emit('webrtc-disconnect', { targetId: peerId });
  }
}

// ==========================================
// 5. SIDEBAR CARDS DOM INJECTION
// ==========================================
function injectRemoteVideoCard(peerId, stream) {
  const list = document.getElementById('members-list');
  const playerData = currentPlayers[peerId];
  if (!playerData) return;

  // Check if card already exists
  let card = document.getElementById(`card-${peerId}`);
  if (!card) {
    card = document.createElement('div');
    card.id = `card-${peerId}`;
    card.className = 'member-card glass';

    const info = document.createElement('div');
    info.className = 'member-info';

    // Dot Preview
    const avatarPre = document.createElement('div');
    avatarPre.className = 'avatar-preview';
    avatarPre.style.backgroundColor = getAvatarColor(playerData.avatarStyle);
    info.appendChild(avatarPre);

    const nameDetails = document.createElement('div');
    nameDetails.className = 'name-details';
    const nameSpan = document.createElement('span');
    nameSpan.className = 'name';
    nameSpan.innerText = playerData.name;
    const statusSpan = document.createElement('span');
    statusSpan.className = 'role-badge';
    statusSpan.innerText = getStatusLabel(playerData.status);
    nameDetails.appendChild(nameSpan);
    nameDetails.appendChild(statusSpan);
    info.appendChild(nameDetails);

    // Audio status icon indicator
    const audioInd = document.createElement('div');
    audioInd.className = 'audio-indicator';
    audioInd.innerHTML = '<i class="fa-solid fa-microphone"></i>';
    info.appendChild(audioInd);

    card.appendChild(info);

    // Video wrapper
    const videoBox = document.createElement('div');
    videoBox.className = 'video-preview-box';

    const video = document.createElement('video');
    video.autoplay = true;
    video.playsinline = true;
    video.srcObject = stream;

    // Placeholder
    const placeholder = document.createElement('div');
    placeholder.className = 'cam-placeholder';
    placeholder.innerHTML = '<i class="fa-solid fa-video-slash"></i><span>Camera Off</span>';

    videoBox.appendChild(video);
    videoBox.appendChild(placeholder);

    // Proximity badge
    const proxBadge = document.createElement('div');
    proxBadge.className = 'proximity-badge';
    proxBadge.innerText = 'Connecting...';
    videoBox.appendChild(proxBadge);

    card.appendChild(videoBox);
    list.appendChild(card);

    // Save elements for quick updates
    peerConnections[peerId].cardElement = card;
    peerConnections[peerId].videoElement = video;

    // Set initial media visual toggles
    updateMediaUIVisuals(peerId, playerData.isMuted, playerData.isCamOff);
  }
}

// Media UI States updater
function updateMediaUIVisuals(peerId, isMuted, isCamOff) {
  const peer = peerConnections[peerId];
  if (!peer || !peer.cardElement) return;

  const card = peer.cardElement;
  
  // Update mic icon
  const micIcon = card.querySelector('.audio-indicator');
  if (micIcon) {
    if (isMuted) {
      micIcon.className = 'audio-indicator muted';
      micIcon.innerHTML = '<i class="fa-solid fa-microphone-slash"></i>';
    } else {
      micIcon.className = 'audio-indicator';
      micIcon.innerHTML = '<i class="fa-solid fa-microphone"></i>';
    }
  }

  // Update cam display
  const placeholder = card.querySelector('.cam-placeholder');
  const video = card.querySelector('video');
  if (placeholder && video) {
    if (isCamOff) {
      placeholder.classList.remove('hidden');
      video.style.display = 'none';
    } else {
      placeholder.classList.add('hidden');
      video.style.display = 'block';
    }
  }
}

function getAvatarColor(style) {
  const mapping = {
    'dev-blue': '#3b82f6',
    'des-purple': '#a855f7',
    'mgr-orange': '#f97316',
    'qa-green': '#22c55e'
  };
  return mapping[style] || '#ffffff';
}

function getStatusLabel(status) {
  const mapping = {
    'working': '🟢 Active Working',
    'meeting': '🔵 In Meeting',
    'away': '🟠 Away'
  };
  return mapping[status] || status;
}

// ==========================================
// 6. INTERACTIVE MODAL & COLLAB WORKSPACE
// ==========================================
let noteEditDebounce = null;

function openInteractiveModal(obj) {
  const modal = document.getElementById('iframe-modal');
  const iframe = document.getElementById('object-iframe');
  
  document.getElementById('modal-title').innerText = obj.name;
  
  // Set icon classes
  const icon = document.getElementById('modal-icon');
  icon.className = `fa-solid ${obj.icon}`;

  // Default tab activation
  activateTab('app');

  // Load URL in iframe
  iframe.src = obj.url;
  
  // Show Modal
  modal.classList.remove('hidden');
}

function closeInteractiveModal() {
  const modal = document.getElementById('iframe-modal');
  const iframe = document.getElementById('object-iframe');
  
  // Clear iframe to stop playback/network usage
  iframe.src = 'about:blank';
  modal.classList.add('hidden');
}

function activateTab(tabId) {
  // Toggle Tab active button classes
  document.getElementById('tab-app').classList.toggle('active', tabId === 'app');
  document.getElementById('tab-notepad').classList.toggle('active', tabId === 'notepad');

  // Toggle Tab content visibility
  document.getElementById('modal-iframe-container').classList.toggle('active', tabId === 'app');
  document.getElementById('modal-notepad-container').classList.toggle('active', tabId === 'notepad');
}

// Synced Notepad listeners
const notepadTextarea = document.getElementById('notepad-textarea');
notepadTextarea.addEventListener('input', () => {
  const syncStatus = document.getElementById('notepad-sync-status');
  syncStatus.className = 'sync-status saving';
  syncStatus.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

  // Debounce sync packets
  clearTimeout(noteEditDebounce);
  noteEditDebounce = setTimeout(() => {
    socket.emit('edit-note', notepadTextarea.value);
    syncStatus.className = 'sync-status';
    syncStatus.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Synced';
  }, 400);
});

// ==========================================
// 7. SOCKET.IO EVENT HANDLERS
// ==========================================
socket.on('current-players', (players) => {
  myPlayerId = socket.id;
  currentPlayers = players;

  // Refresh Sidebar Counter
  updateOnlineCount();

  // Draw existing remote players inside scene
  const scene = game.scene.keys.OfficeScene;
  if (!scene) return;

  Object.entries(players).forEach(([id, player]) => {
    if (id === myPlayerId) {
      // Setup local name tag
      scene.localPlayerNameText.setText(player.name);
      return;
    }
    spawnRemotePlayer(scene, player);
  });
});

socket.on('new-player', (player) => {
  currentPlayers[player.id] = player;
  updateOnlineCount();

  // Draw remote sprite inside scene
  const scene = game.scene.keys.OfficeScene;
  if (scene) {
    spawnRemotePlayer(scene, player);
  }
});

socket.on('player-moved', (movement) => {
  const player = currentPlayers[movement.id];
  if (player) {
    player.x = movement.x;
    player.y = movement.y;
    player.direction = movement.direction;

    // Move sprite in Phaser scene with a smooth Tween
    const scene = game.scene.keys.OfficeScene;
    if (scene) {
      const sprite = scene.otherPlayers.getChildren().find(s => s.getData('id') === movement.id);
      if (sprite) {
        // Interpolate coordinate positions
        scene.tweens.add({
          targets: sprite,
          x: movement.x,
          y: movement.y,
          duration: 45, // matches game update interval
          ease: 'Linear'
        });

        // Trigger animations
        sprite.anims.play(`${player.avatarStyle}-walk-${movement.direction}`, true);
        sprite.setData('idleDirection', movement.direction);
      }
    }
  }
});

socket.on('player-status-changed', (data) => {
  const player = currentPlayers[data.id];
  if (player) {
    player.status = data.status;
    
    // Update role badge in card
    const card = document.getElementById(`card-${data.id}`);
    if (card) {
      card.querySelector('.role-badge').innerText = getStatusLabel(data.status);
    }

    // Visual updates above character sprite head
    const scene = game.scene.keys.OfficeScene;
    if (scene) {
      const sprite = scene.otherPlayers.getChildren().find(s => s.getData('id') === data.id);
      if (sprite && sprite.nameTag) {
        const statusEmoji = data.status === 'meeting' ? '💬' : data.status === 'away' ? '🚫' : '💼';
        sprite.nameTag.setText(`${statusEmoji} ${player.name}`);
      }
    }
  }
});

socket.on('player-media-changed', (data) => {
  const player = currentPlayers[data.id];
  if (player) {
    player.isMuted = data.isMuted;
    player.isCamOff = data.isCamOff;
    updateMediaUIVisuals(data.id, data.isMuted, data.isCamOff);
  }
});

socket.on('player-zone-changed', (data) => {
  const player = currentPlayers[data.id];
  if (player) {
    player.zoneId = data.zoneId;
  }
});

socket.on('note-updated', (text) => {
  // Only update textarea if user is not actively editing it
  if (document.activeElement !== notepadTextarea) {
    notepadTextarea.value = text;
  }
});

socket.on('player-disconnected', (id) => {
  console.log(`[Socket] Player disconnected: ${id}`);
  
  // Clean up WebRTC
  closeWebRTCPeer(id);

  // Clean up Phaser sprite
  const scene = game.scene.keys.OfficeScene;
  if (scene) {
    const sprite = scene.otherPlayers.getChildren().find(s => s.getData('id') === id);
    if (sprite) {
      if (sprite.nameTag) sprite.nameTag.destroy();
      sprite.destroy();
    }
  }

  delete currentPlayers[id];
  updateOnlineCount();
});

// Broker WebRTC forwarding events
socket.on('webrtc-offer', (data) => {
  handleIncomingOffer(data.senderId, data.sdp);
});

socket.on('webrtc-answer', (data) => {
  handleIncomingAnswer(data.senderId, data.sdp);
});

socket.on('webrtc-ice-candidate', (data) => {
  handleIncomingIceCandidate(data.senderId, data.candidate);
});

socket.on('webrtc-disconnect', (data) => {
  console.log(`[WebRTC] Partner requested direct media disconnect: ${data.senderId}`);
  closeWebRTCPeer(data.senderId);
});

// ==========================================
// 8. SPRITE CREATOR & UI UTILITIES
// ==========================================
function spawnRemotePlayer(scene, player) {
  // Check if player sprite already exists to prevent duplicates
  const existingSprite = scene.otherPlayers.getChildren().find(s => s.getData('id') === player.id);
  if (existingSprite) return;

  const sprite = scene.physics.add.sprite(player.x, player.y, player.avatarStyle);
  sprite.setData('id', player.id);
  sprite.setData('idleDirection', player.direction);
  sprite.anims.play(`${player.avatarStyle}-idle-${player.direction}`);

  // Create name tag text
  const statusEmoji = player.status === 'meeting' ? '💬' : player.status === 'away' ? '🚫' : '💼';
  const nameTag = scene.add.text(player.x, player.y - 22, `${statusEmoji} ${player.name}`, {
    fontFamily: 'Space Grotesk',
    fontSize: '10px',
    fontWeight: 'bold',
    fill: '#a1a1aa',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: { x: 5, y: 2 }
  }).setOrigin(0.5);

  sprite.nameTag = nameTag;

  // Add updating follow logic to the sprite structure
  sprite.on('destroy', () => {
    nameTag.destroy();
  });

  // Keep name tags following remote players
  scene.events.on('update', () => {
    if (sprite && sprite.active) {
      nameTag.setPosition(sprite.x, sprite.y - 22);
      // If player stops moving, play idle anims
      if (sprite.body && sprite.body.speed === 0) {
        const idleDir = sprite.getData('idleDirection') || 'down';
        sprite.anims.play(`${player.avatarStyle}-idle-${idleDir}`, true);
      }
    }
  });

  scene.otherPlayers.add(sprite);
}

function updateOnlineCount() {
  const count = Object.keys(currentPlayers).length;
  document.getElementById('member-count').innerText = `${count} Online`;
}

// ==========================================
// 9. CLIENT CONTROLS & INTERFACE BINDINGS
// ==========================================

// Join button action
document.getElementById('join-btn').addEventListener('click', async () => {
  const usernameInput = document.getElementById('username-input');
  myName = usernameInput.value.trim() || 'Alex Mercer';
  
  const activeAvatarOption = document.querySelector('.avatar-option.active');
  myAvatarStyle = activeAvatarOption ? activeAvatarOption.getAttribute('data-style') : 'dev-blue';

  // Request camera and microphone stream
  await requestUserMedia();

  // Hide Lobby, Show Workspace
  document.getElementById('lobby-screen').classList.add('hidden');
  document.getElementById('app-screen').classList.remove('hidden');

  // Launch Phaser Game
  initPhaserGame();

  // Update local player card display name
  const localCard = document.querySelector('.member-card.local');
  localCard.querySelector('.name').innerText = `${myName} (You)`;
  localCard.querySelector('.avatar-preview').style.backgroundColor = getAvatarColor(myAvatarStyle);
});

// Avatar selector options click
const avatarOptions = document.querySelectorAll('.avatar-option');
avatarOptions.forEach(opt => {
  opt.addEventListener('click', () => {
    avatarOptions.forEach(o => o.classList.remove('active'));
    opt.classList.add('active');
  });
});

// Toggle microphone
const toggleMicBtn = document.getElementById('toggle-mic');
toggleMicBtn.addEventListener('click', () => {
  isMuted = !isMuted;
  if (localStream) {
    localStream.getAudioTracks().forEach(track => {
      track.enabled = !isMuted;
    });
  }

  toggleMicBtn.classList.toggle('muted', isMuted);
  if (isMuted) {
    toggleMicBtn.innerHTML = '<i class="fa-solid fa-microphone-slash"></i>';
    toggleMicBtn.title = 'Unmute Microphone';
  } else {
    toggleMicBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
    toggleMicBtn.title = 'Mute Microphone';
  }

  // Sync state through server
  socket.emit('change-media', { isMuted, isCamOff });
  
  // Update local video frame indicator
  const localCard = document.querySelector('.member-card.local');
  const indicator = localCard.querySelector('.audio-indicator');
  if (indicator) {
    indicator.className = isMuted ? 'audio-indicator muted' : 'audio-indicator';
    indicator.innerHTML = isMuted ? '<i class="fa-solid fa-microphone-slash"></i>' : '<i class="fa-solid fa-microphone"></i>';
  }
});

// Toggle video camera
const toggleCamBtn = document.getElementById('toggle-cam');
toggleCamBtn.addEventListener('click', () => {
  isCamOff = !isCamOff;
  if (localStream) {
    localStream.getVideoTracks().forEach(track => {
      track.enabled = !isCamOff;
    });
  }

  toggleCamBtn.classList.toggle('muted', isCamOff);
  if (isCamOff) {
    toggleCamBtn.innerHTML = '<i class="fa-solid fa-video-slash"></i>';
    toggleCamBtn.title = 'Turn Camera On';
    document.getElementById('local-cam-placeholder').classList.remove('hidden');
    document.getElementById('local-video').style.display = 'none';
  } else {
    toggleCamBtn.innerHTML = '<i class="fa-solid fa-video"></i>';
    toggleCamBtn.title = 'Turn Camera Off';
    document.getElementById('local-cam-placeholder').classList.add('hidden');
    document.getElementById('local-video').style.display = 'block';
  }

  // Sync state through server
  socket.emit('change-media', { isMuted, isCamOff });
});

// Change Status selector
const statusSelect = document.getElementById('status-select');
statusSelect.addEventListener('change', () => {
  const status = statusSelect.value;
  socket.emit('change-status', status);

  // Update local name preview role badge
  const localCard = document.querySelector('.member-card.local');
  localCard.querySelector('.role-badge').innerText = getStatusLabel(status);
});

// Modal Close click
document.getElementById('modal-close').addEventListener('click', () => {
  closeInteractiveModal();
});

// Modal Tabs click bindings
document.getElementById('tab-app').addEventListener('click', () => activateTab('app'));
document.getElementById('tab-notepad').addEventListener('click', () => activateTab('notepad'));

// ==========================================
// 10. PHASER 3 BOOTSTRAPPER
// ==========================================
let game = null;

function initPhaserGame() {
  const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    scene: OfficeScene
  };

  game = new Phaser.Game(config);
}
