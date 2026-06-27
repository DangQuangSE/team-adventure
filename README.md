# Team Adventure

Team Adventure is a web-based virtual office designed to make remote work feel less isolated and less mechanical. Instead of only opening chat rooms or scheduled calls, users enter a 2D office as a character, walk through departments, meet teammates naturally, open shared work tools, and start voice conversations by standing near each other.

The project is intentionally shaped like a game, but its goal is work, not distraction: presence, quick conversation, meeting rooms, focus spaces, shared notes, and team rituals should all feel spatial and easy to use.

## Product Purpose

Remote teams often lose the small signals that make office work feel alive: who is around, who is busy, who is open to a quick question, and where collaboration is happening. Team Adventure solves that by turning the workspace into a lightweight interactive office.

The product aims to provide:

- A sense of presence for distributed teams.
- Natural, low-friction voice conversations.
- Clear personal status and availability.
- Shared spaces for meetings, focus work, project work, and casual chats.
- A visual office environment that can grow into departments, rooms, desks, and team rituals.

## Repository Structure

```text
team-adventure
|-- team-adventure-be
|   `-- Spring Boot realtime backend
|-- team-adventure-fe
|   `-- JavaScript and Phaser frontend
`-- README.md
```

The old Node.js and Socket.io MVP was replaced with this cleaner two-side structure:

- `team-adventure-be`: Spring Boot backend for realtime state, WebSocket messaging, note sync, and WebRTC signaling.
- `team-adventure-fe`: Browser frontend using JavaScript modules and Phaser for the 2D office experience.

## Current Features

### Virtual Office

- Users join the office with a display name and avatar style.
- Each user is represented as a character in a 2D Phaser office map.
- Players can move with `WASD` or arrow keys.
- Other online users appear in realtime.
- Player name and status are shown above characters.
- The current map includes lobby, department spaces, a meeting room, a focus room, desks, boards, and a lounge object.

### Realtime Presence

- The backend tracks connected players in memory.
- Player position, direction, status, media state, and current zone are synchronized over WebSocket.
- When a player joins, moves, changes status, enters a zone, or disconnects, all connected clients receive updates.

### Status And Availability

Users can switch between work modes:

- `working`
- `focusing`
- `meeting`
- `away`

These statuses are broadcast to other players and shown in the people panel and name tags.

### Rooms And Zones

The frontend detects which room or zone the local player is currently inside.

Current zone behavior:

- Public areas allow proximity-based voice when players stand close together.
- Private rooms allow voice between players in the same room.
- Zone changes are sent to the backend and broadcast to other clients.

### Shared Note And Board

The project includes a realtime shared note system.

Users can edit notes in two ways:

- From the sidebar `Shared Note` panel.
- By walking near a board object, such as `Whiteboard` or `Project Board`, and pressing `E`.

The board opens a larger synced note modal. Edits are debounced and broadcast to other clients through the Spring Boot WebSocket backend.

### Proximity Voice

The frontend includes WebRTC audio-only proximity voice.

Voice behavior:

- Players standing within `150px` in public space automatically create a peer connection.
- Players inside the same private room can connect even if they are farther apart inside that room.
- Moving away or leaving the shared private zone closes the voice connection.
- Users control their microphone with the `Mic On` / `Mic Off` button.
- Browser microphone permission is requested when the user first turns the mic on.
- Spring Boot acts as the WebRTC signaling broker for offer, answer, ICE candidate, and disconnect messages.

This is currently mesh peer-to-peer WebRTC, which is suitable for early MVP testing. Larger rooms will eventually need an SFU/media server.

## Backend Architecture

Backend path:

```text
team-adventure-be
```

Main layers:

- `domain`: core player model, avatar style, status, position, and repository contract.
- `application`: use cases for joining, moving, changing status, media state, zone state, shared note updates, and disconnect.
- `infrastructure`: in-memory repository implementation.
- `realtime`: WebSocket handler, message DTOs, and WebSocket configuration.

Important backend files:

- `TeamAdventureApplication.java`: Spring Boot entry point.
- `OfficeService.java`: core application use cases.
- `OfficeWebSocketHandler.java`: WebSocket message router and broadcaster.
- `Player.java`: domain entity.
- `InMemoryPlayerRepository.java`: temporary persistence layer.

WebSocket endpoint:

```text
ws://localhost:8080/ws/office
```

Supported client message types:

- `join-office`
- `player-movement`
- `change-status`
- `change-media`
- `change-zone`
- `edit-note`
- `webrtc-offer`
- `webrtc-answer`
- `webrtc-ice-candidate`
- `webrtc-disconnect`

## Frontend Architecture

Frontend path:

```text
team-adventure-fe
```

Main layers:

- `config`: runtime config and office map data.
- `game`: Phaser scene, generated textures, rooms, objects, desks, movement, and interaction detection.
- `realtime`: WebSocket client and proximity voice manager.
- `state`: client-side office store.
- `ui`: DOM bindings for join screen, people list, controls, shared note, board modal, room chip, and voice state.
- `styles`: application CSS.

Important frontend files:

- `src/main.js`: app composition and event wiring.
- `src/game/OfficeScene.js`: Phaser world and interaction logic.
- `src/realtime/officeSocket.js`: WebSocket wrapper.
- `src/realtime/proximityVoice.js`: WebRTC proximity voice.
- `src/ui/officeUi.js`: UI controls and note board modal.
- `src/config/officeMap.js`: room, object, desk, and world definitions.

## Run Locally

### Requirements

- Java 21 or newer.
- Maven 3.9 or newer.
- Node.js 18 or newer.

### Start Backend

```bash
cd team-adventure-be
mvn spring-boot:run
```

Backend runs on:

```text
http://localhost:8080
```

WebSocket runs on:

```text
ws://localhost:8080/ws/office
```

### Start Frontend

In another terminal:

```bash
cd team-adventure-fe
npm.cmd run dev
```

Frontend runs on:

```text
http://localhost:5173
```

On non-Windows shells, `npm run dev` is usually enough.

### Change WebSocket URL

The frontend default WebSocket URL is defined in:

```text
team-adventure-fe/src/config/runtime.js
```

You can override it in the browser console:

```js
localStorage.setItem('teamAdventureWsUrl', 'ws://localhost:8080/ws/office');
```

Then reload the page.

## How To Test The Main Flow

1. Start backend and frontend.
2. Open `http://localhost:5173` in two browser tabs.
3. Join with two different display names.
4. Move both players close together.
5. Click `Mic Off` in both tabs to turn microphones on.
6. Allow microphone permission in the browser.
7. Walk away and confirm the nearby voice connection count returns to zero.
8. Walk near `Whiteboard` or `Project Board`.
9. Press `E` to open the board note.
10. Edit text in one tab and confirm it appears in the other tab.

## Verification

Backend tests:

```bash
cd team-adventure-be
mvn test
```

Frontend syntax check:

```bash
cd team-adventure-fe
npm.cmd run check
```

## Current Limitations

- Data is stored in memory and resets when the backend restarts.
- There is no authentication or user account system yet.
- The office map is defined in JavaScript, not yet loaded from a tilemap editor.
- Visual assets are generated procedurally for now and should be replaced with proper office assets.
- WebRTC is peer-to-peer mesh, which is not ideal for large meetings.
- There is no text chat, file sharing, calendar integration, or task system yet.

## Roadmap

Near-term:

- Replace generated textures with real assets.
- Add a tilemap workflow, likely using Tiled JSON.
- Add persistent users, offices, rooms, desks, and notes.
- Add proper error handling and reconnect behavior for WebSocket.
- Add better voice indicators, speaking state, and device selection.

Mid-term:

- Add authentication and team/workspace membership.
- Add desk ownership and personal workspace customization.
- Add room booking, meeting metadata, and calendar integration.
- Add task/project board integration.
- Add text chat and direct messages.

Long-term:

- Add an SFU for scalable voice/video rooms.
- Add admin tools for office layout editing.
- Add multiple office floors or team worlds.
- Add lightweight work rituals such as standup, focus sessions, retrospectives, and demo areas.
