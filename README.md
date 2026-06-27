# Team Adventure

Team Adventure is a virtual office prototype rebuilt as two independent apps:

- `team-adventure-be`: Spring Boot realtime backend.
- `team-adventure-fe`: JavaScript frontend with Phaser-powered office gameplay.

The old Node/Socket.io MVP source has been replaced with this structure so the project can grow with clearer boundaries.

## Architecture

```text
team-adventure
├── team-adventure-be
│   └── Spring Boot WebSocket backend
└── team-adventure-fe
    └── Static JavaScript/Phaser frontend
```

Backend layers:

- `domain`: player model, status, avatar style, repository contract.
- `application`: office use cases for join, movement, media state, zones, and shared notes.
- `infrastructure`: in-memory persistence implementation.
- `realtime`: WebSocket endpoint and DTOs.

Frontend layers:

- `config`: runtime and office map definitions.
- `game`: Phaser scene and generated textures.
- `realtime`: browser WebSocket client.
- `state`: client-side office store.
- `ui`: DOM bindings and panels.

## Run Locally

Start backend:

```bash
cd team-adventure-be
mvn spring-boot:run
```

Start frontend in another terminal:

```bash
cd team-adventure-fe
npm.cmd run dev
```

Open:

```text
http://localhost:5173
```

The frontend connects to:

```text
ws://localhost:8080/ws/office
```

To override it during development:

```js
localStorage.setItem('teamAdventureWsUrl', 'ws://localhost:8080/ws/office')
```

## Current Feature Baseline

- Join office with name and avatar style.
- Move around a Phaser office map.
- See other connected players in realtime.
- Track rooms and zones.
- Update status and media state.
- Share a realtime team note.
- Keep WebRTC signaling message types reserved for the next implementation step.

## Next Engineering Steps

- Add persistent users, offices, rooms, desks, and notes.
- Replace generated canvas textures with a proper tilemap and asset pipeline.
- Add authenticated sessions before exposing this outside local development.
- Finish WebRTC media orchestration on top of the Spring WebSocket broker.
