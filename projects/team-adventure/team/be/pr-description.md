# PR: Backend Implementation — Virtual Office MVP

## Summary

This pull request implements the Virtual Office MVP backend refactoring using a Clean Architecture (Hexagonal) pattern at the `mid` complexity level. It decouples the core domain models and business logic from the HTTP and WebSocket frameworks (Express and Socket.io), making it modular and fully testable.

## Changes

### New files
- `server.js` — Entry point bootstrapper that wires layers together.
- `src/domain/Player.js` — Domain entity modeling Player attributes and state mutations.
- `src/domain/PlayerRepository.js` — In-memory player state storage repository.
- `src/usecases/PlayerUseCases.js` — Application rules handling spawning, movement updates, media status toggles, zone entries, and shared notes updates.
- `src/adapters/SocketController.js` — Socket.io event mapping adapter parsing WebSocket messages and calling Use Cases.
- `src/frameworks/ExpressServer.js` — Express and Socket.io bootstrap setup configuration.
- `.env.example` — Configuration placeholders list.

### Modified files
None (initial backend architectural isolation).

## API Endpoints

This is a real-time event-based server communicating via Socket.io channels:

| Event Name (In) | Event Name (Out) | Description | Auth required |
|---|---|---|---|
| join-office | current-players, note-updated, new-player | Spawns a player and syncs current state | No |
| player-movement | player-moved | Updates player coordinates (throttled) | No |
| change-status | player-status-changed | Updates user availability status | No |
| change-media | player-media-changed | Toggles client microphone and camera states | No |
| change-zone | player-zone-changed | Tracks player room entry and updates zone context | No |
| edit-note | note-updated | Edits collaborative whiteboard notepad text | No |
| webrtc-offer | webrtc-offer | Brokers WebRTC SDP Offer to peer | No |
| webrtc-answer | webrtc-answer | Brokers WebRTC SDP Answer to peer | No |
| webrtc-ice-candidate | webrtc-ice-candidate | Forwards connection ICE candidates | No |
| webrtc-disconnect | webrtc-disconnect | Explicitly signals media disconnection to peer | No |

## Database Changes
No persistent database; in-memory data structures are initialized upon node process boot.

## Environment Variables Required
- `PORT` — Port number running the Express instance.
- `NODE_ENV` — Environment context ('development' | 'production').

## Testing Notes
- Run `node server.js` to boot the application server.
- Connect multiple browser tabs to `http://localhost:3000` to verify join, movement sync, note sync, and console logs.
- Assure `.env` is initialized from `.env.example` before local/staging boot.
