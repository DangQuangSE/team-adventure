export const AVATAR_ASSETS = {
  'dev-blue': 'assets/avartars/boy1-rmpg.png',
  'design-purple': 'assets/avartars/girl3-rmbg.png',
  'manager-orange': 'assets/avartars/boy2-rmbg.png',
  'qa-green': 'assets/avartars/girl0-rmbg.png'
};

export function loadAvatarAssets(scene) {
  Object.entries(AVATAR_ASSETS).forEach(([key, path]) => {
    scene.load.spritesheet(key, path, {
      frameWidth: 153,
      frameHeight: 408
    });
  });
}

export function createTextures(scene) {
  createTile(scene, 'floor', '#d8c8a8', '#c6ad84');
  createTile(scene, 'room-floor', '#b7d6d0', '#97beb8');
  createDesk(scene);
  createWhiteboard(scene);
  createCoffee(scene);
}

function createTile(scene, key, base, accent) {
  const canvas = scene.textures.createCanvas(key, 32, 32);
  const ctx = canvas.context;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 32, 32);
  ctx.fillStyle = accent;
  ctx.fillRect(0, 30, 32, 2);
  ctx.fillRect(30, 0, 2, 32);
  canvas.refresh();
}

function createDesk(scene) {
  const canvas = scene.textures.createCanvas('desk', 82, 46);
  const ctx = canvas.context;
  ctx.fillStyle = '#8b5e34';
  ctx.fillRect(0, 8, 82, 34);
  ctx.fillStyle = '#5c4030';
  ctx.fillRect(0, 8, 82, 6);
  ctx.fillStyle = '#1f2937';
  ctx.fillRect(28, 0, 26, 18);
  ctx.fillStyle = '#60a5fa';
  ctx.fillRect(31, 3, 20, 12);
  canvas.refresh();
}

function createWhiteboard(scene) {
  const canvas = scene.textures.createCanvas('whiteboard', 96, 42);
  const ctx = canvas.context;
  ctx.fillStyle = '#475569';
  ctx.fillRect(0, 0, 96, 42);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(4, 4, 88, 32);
  ctx.fillStyle = '#2563eb';
  ctx.fillRect(14, 12, 28, 3);
  ctx.fillStyle = '#16a34a';
  ctx.fillRect(54, 12, 20, 14);
  canvas.refresh();
}

function createCoffee(scene) {
  const canvas = scene.textures.createCanvas('coffee', 58, 58);
  const ctx = canvas.context;
  ctx.fillStyle = '#704214';
  ctx.fillRect(8, 18, 42, 28);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(20, 8, 18, 22);
  ctx.fillStyle = '#c2410c';
  ctx.fillRect(24, 12, 10, 14);
  canvas.refresh();
}
