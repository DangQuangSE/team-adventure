# Acceptance Criteria — Virtual Office MVP

## Acceptance Criteria

### US-001 — Spawn player with display name and avatar style

**Scenario: User enters valid details and enters office**
- **Given** the user is on the Lobby Join Screen.
- **When** the user inputs a name "Alice" (length between 1 and 15 characters), selects the "Des Purple" avatar style, and clicks "Enter Office".
- **Then** the lobby overlay hides, the main app screen displays, and Alice's avatar spawns near the lobby entrance.
- **And** Alice's display name "Alice" shows above her avatar.
- **And** Alice's status defaults to "Working" (green dot).

**Scenario: User inputs blank name**
- **Given** the user is on the Lobby Join Screen.
- **When** the user leaves the name input blank and clicks "Enter Office".
- **Then** the system prompts the user to enter a name and does not spawn them into the office.

---

### US-002 — Player movement inside the game world

**Scenario: User navigates using keys**
- **Given** the player has successfully spawned in the office.
- **When** the player presses the "D" key or "Right Arrow" key.
- **Then** the player avatar plays the walking-right animation and moves right at a speed of 150.
- **And** the player's new position is synchronized and updated on all other players' screens.

**Scenario: Player runs into static obstacles**
- **Given** the player is next to an office desk obstacle.
- **When** the player holds the key to move towards the desk.
- **Then** the avatar walking animation plays but the player's position is blocked by physical collision bounds and does not pass through the desk.

---

### US-003 — Toggle camera and microphone state

**Scenario: Player mutes microphone**
- **Given** the player is in the main office workspace.
- **When** the player clicks the "Toggle Mic" button in the control panel.
- **Then** the microphone icon switches to a muted state, and the local mic track is muted.
- **And** the status update is broadcast to other players, displaying a muted icon next to this player's name in their members list.

**Scenario: Player turns camera back on**
- **Given** the player has their camera turned off.
- **When** the player clicks the "Toggle Cam" button.
- **Then** the camera feed starts, the camera icon changes to active, and the video track is broadcast to nearby peers.

---

### US-004 — Update player status indicator

**Scenario: User changes status from dropdown**
- **Given** the player is active in the workspace.
- **When** the player selects "Away" from the status dropdown menu.
- **Then** the status indicator next to the player's avatar and on the member card changes to orange.
- **And** the new status "Away" is broadcast to all online players.

---

### US-005 — Proximity-based audio/video peer connection

**Scenario: Two players walk into proximity**
- **Given** Player A and Player B are both in the public office space and are not connected.
- **When** Player A walks closer to Player B until the distance between them is <= 150 pixels.
- **Then** Player A and Player B initiate a WebRTC handshake.
- **And** a peer connection is established, and their live video cards display on each other's sidebar.
- **And** the proximity count HUD updates to show "1 Connection".

**Scenario: Media track is unavailable on handshake**
- **Given** Player A has blocked camera and microphone permissions.
- **When** Player A walks within 150 pixels of Player B.
- **Then** the system initiates connection using fallback dummy tracks (black screen and silent audio) so that the WebRTC connection is established successfully without crashing.

---

### US-006 — Private zone meeting call isolation

**Scenario: Two players enter the same private room**
- **Given** Player A and Player B are in the public office space.
- **When** both players walk into "Meeting Room 1".
- **Then** their avatars cross the neon boundaries, and a banner "Meeting Room 1 (Private Call)" displays on their screen.
- **And** they establish a WebRTC connection with each other, regardless of their distance (even if > 150px), as long as they are both inside the room.

**Scenario: Player enters a room while others are outside**
- **Given** Player A is inside "Meeting Room 1" and Player B is in the public corridor, 100 pixels away from the room boundary.
- **When** Player B is close to the room but outside it.
- **Then** no WebRTC connection is made between them, isolating the conversation inside the room.

---

### US-007 — Spatial sound volume attenuation

**Scenario: Distance between players changes**
- **Given** Player A and Player B are in a proximity call.
- **When** Player A walks further away from Player B (from 50px to 140px).
- **Then** the volume of Player B's audio track in Player A's headphones decreases proportionally.

---

### US-008 — Real-time synchronized collaborative notepad

**Scenario: Player edits shared notepad**
- **Given** Player A has opened the collaborative notepad modal.
- **When** Player A types a new target line of text in the textarea.
- **Then** the edit is sent via Socket.io to the server, and the server broadcasts the updated text to all other players.
- **And** Player B (who also has the notepad open) sees the text area update in real-time.

---

### US-009 — Interactive whiteboard and TV object integrations

**Scenario: Player interacts with a whiteboard**
- **Given** the player is standing next to the "Collaborative Whiteboard" object.
- **When** the player presses the "E" key.
- **Then** a modal opens displaying Excalidraw within an iframe, allowing the user to draw and sketch.

**Scenario: Player walks away from interactive object**
- **Given** the player has the whiteboard modal open.
- **When** the player moves their avatar away from the whiteboard object in the game window.
- **Then** the whiteboard modal automatically closes to prevent remote access from a distance.
