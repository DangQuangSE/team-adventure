export const WORLD = {
  width: 1280,
  height: 832,
  spawn: { x: 420, y: 360 }
};

export const ROOMS = [
  {
    id: 'lobby',
    name: 'Lobby',
    type: 'public',
    x: 320,
    y: 288,
    width: 260,
    height: 180,
    color: 0x4b5563
  },
  {
    id: 'engineering',
    name: 'Engineering',
    type: 'department',
    x: 640,
    y: 120,
    width: 420,
    height: 260,
    color: 0x2563eb
  },
  {
    id: 'design-studio',
    name: 'Design Studio',
    type: 'department',
    x: 150,
    y: 120,
    width: 300,
    height: 220,
    color: 0x9333ea
  },
  {
    id: 'meeting-room',
    name: 'Meeting Room',
    type: 'private',
    x: 120,
    y: 520,
    width: 360,
    height: 220,
    color: 0x0f766e
  },
  {
    id: 'focus-room',
    name: 'Focus Room',
    type: 'private',
    x: 760,
    y: 520,
    width: 320,
    height: 220,
    color: 0xb45309
  }
];

export const OBJECTS = [
  {
    id: 'whiteboard',
    name: 'Whiteboard',
    x: 285,
    y: 520,
    width: 90,
    height: 36,
    kind: 'whiteboard'
  },
  {
    id: 'project-board',
    name: 'Project Board',
    x: 835,
    y: 120,
    width: 96,
    height: 40,
    kind: 'board'
  },
  {
    id: 'coffee',
    name: 'Coffee Corner',
    x: 1140,
    y: 700,
    width: 70,
    height: 60,
    kind: 'lounge'
  }
];

export const DESKS = [
  { x: 660, y: 245 },
  { x: 790, y: 245 },
  { x: 920, y: 245 },
  { x: 660, y: 330 },
  { x: 790, y: 330 },
  { x: 920, y: 330 },
  { x: 210, y: 245 },
  { x: 330, y: 245 },
  { x: 890, y: 640 },
  { x: 990, y: 640 }
];
