export const WORLD = {
  width: 1536,
  height: 1024,
  spawn: { x: 1190, y: 765 },
  background: 'assets/background/background.png'
};

export const ROOMS = [
  {
    id: 'welcome',
    name: 'Welcome / Reception',
    type: 'public',
    x: 1110,
    y: 640,
    width: 260,
    height: 190,
    color: 0x4b5563
  },
  {
    id: 'dev-zone',
    name: 'Dev Zone',
    type: 'department',
    x: 170,
    y: 230,
    width: 405,
    height: 285,
    color: 0x2563eb
  },
  {
    id: 'meeting-room',
    name: 'Meeting Room',
    type: 'private',
    x: 520,
    y: 105,
    width: 390,
    height: 220,
    color: 0x0f766e
  },
  {
    id: 'focus-room',
    name: 'Focus Room',
    type: 'private',
    x: 910,
    y: 135,
    width: 150,
    height: 210,
    color: 0xb45309
  },
  {
    id: 'call-room',
    name: 'Call Room',
    type: 'private',
    x: 1050,
    y: 180,
    width: 180,
    height: 170,
    color: 0x7c3aed
  },
  {
    id: 'open-office',
    name: 'Open Office',
    type: 'department',
    x: 560,
    y: 310,
    width: 520,
    height: 260,
    color: 0x2563eb
  },
  {
    id: 'lounge',
    name: 'Lounge',
    type: 'public',
    x: 330,
    y: 575,
    width: 260,
    height: 220,
    color: 0x9333ea
  },
  {
    id: 'event-area',
    name: 'Event Area',
    type: 'public',
    x: 910,
    y: 600,
    width: 260,
    height: 160,
    color: 0xea580c
  }
];

export const OBJECTS = [
  {
    id: 'whiteboard',
    name: 'Dev Whiteboard',
    x: 455,
    y: 270,
    width: 120,
    height: 80,
    kind: 'whiteboard'
  },
  {
    id: 'project-board',
    name: 'Project Board',
    x: 1085,
    y: 540,
    width: 120,
    height: 110,
    kind: 'board'
  },
  {
    id: 'event-screen',
    name: 'Event Screen',
    x: 1030,
    y: 640,
    width: 120,
    height: 90,
    kind: 'board'
  },
  {
    id: 'lounge-table',
    name: 'Lounge Table',
    x: 485,
    y: 710,
    width: 150,
    height: 90,
    kind: 'lounge'
  }
];

export const DESKS = [];
