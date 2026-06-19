# Integration Test Cases — Virtual Office MVP

## Integration Test Cases

### TC-INT-001: Socket Join Office Broadcast
- **Objective:** Verify that when a client joins the office, the server registers the connection and broadcasts the new player to other online clients.
- **Preconditions:** Server is running; Player A is already connected.
- **Execution steps:**
  1. Connect Player B via socket.io client.
  2. Emit `join-office` payload `{ name: 'Bob', avatarStyle: 'mgr-orange' }`.
  3. Verify Player B receives `current-players` map containing Player A and Player B.
  4. Verify Player B receives `note-updated` event with shared note.
  5. Verify Player A receives `new-player` event with Player B's data structure.
- **Expected Outcome:** Both players receive appropriate states, and Player A is notified of Bob's spawn. Pass.

### TC-INT-002: Throttled Coordinate Update Sync
- **Objective:** Verify that player position changes are broadcast to other clients in real-time.
- **Preconditions:** Player A and Player B are connected.
- **Execution steps:**
  1. Player A moves and emits `player-movement` payload `{ x: 420, y: 360, direction: 'right' }`.
  2. Verify Player B receives `player-moved` broadcast with Player A's coordinates and ID.
- **Expected Outcome:** Coordinate shifts are propagated to other clients. Pass.

### TC-INT-003: Collaborative Notepad Update Broadcast
- **Objective:** Verify notepad edits are saved on server and synced to other clients.
- **Preconditions:** Player A and Player B are connected.
- **Execution steps:**
  1. Player A modifies notepad text and emits `edit-note` with text "New Note Entry".
  2. Verify Player B receives `note-updated` broadcast with "New Note Entry".
  3. Verify server state memory matches "New Note Entry".
- **Expected Outcome:** Shared notepad stays synchronized across all clients. Pass.
