# Task Breakdown — Virtual Office MVP

## Tasks

### TASK-001: Setup Express & Socket.io Server Framework
**Story:** US-001
**Type:** Backend
**Assigned to:** BE Dev
**Effort:** S
**Sprint:** 1
**Depends on:** None
**Description:** Initialize Node.js Express server and setup Socket.io configuration to run on configurable ports using `dotenv` for environment configuration.

### TASK-002: Implement In-Memory Player Repository
**Story:** US-001
**Type:** Database
**Assigned to:** BE Dev
**Effort:** M
**Sprint:** 1
**Depends on:** TASK-001
**Description:** Implement the Clean Architecture repository pattern for storing player session states, coordinates, and notes in-memory.

### TASK-003: Implement Player Spawning & Movement Sync API
**Story:** US-001, US-002
**Type:** Backend
**Assigned to:** BE Dev
**Effort:** M
**Sprint:** 1
**Depends on:** TASK-002
**Description:** Code the use cases and socket controllers to handle `join-office` and `player-movement` events, broadcasting updates to other online clients.

### TASK-004: Build Phaser 3 Lobby UI
**Story:** US-001
**Type:** Frontend
**Assigned to:** FE Dev
**Effort:** S
**Sprint:** 1
**Depends on:** None
**Description:** Create the HTML join overlay with nickname validation (BR-001) and active buttons to select themes (Dev Blue, Des Purple, Mgr Orange, QA Green).

### TASK-005: Develop Phaser 3 Game World and Player Sprite Movements
**Story:** US-002
**Type:** Frontend
**Assigned to:** FE Dev
**Effort:** M
**Sprint:** 1
**Depends on:** TASK-004
**Description:** Build Phaser 3 Canvas world. Draw procedural floor textures, desks, and plants. Program keyboard movement bounds colliding with obstacles.

### TASK-006: Construct Media controls & Status drop-down sync
**Story:** US-003, US-004
**Type:** Frontend
**Assigned to:** FE Dev
**Effort:** S
**Sprint:** 1
**Depends on:** TASK-005
**Description:** Build sidebar controls for camera toggling, mic muting, and availability status selection. Integrate client emitters for `change-status` and `change-media`.

### TASK-007: Code Collaborative Notepad Sync Backend
**Story:** US-008
**Type:** Backend
**Assigned to:** BE Dev
**Effort:** M
**Sprint:** 1
**Depends on:** TASK-003
**Description:** Develop websocket handlers on server side to receive note edits and broadcast notepad contents to other players.

### TASK-008: Integrate Client-side Sync Notepad UI
**Story:** US-008
**Type:** Frontend
**Assigned to:** FE Dev
**Effort:** M
**Sprint:** 1
**Depends on:** TASK-006
**Description:** Create a shared notepad popup modal in the UI with textareas updating locally and transmitting edits via Socket.io.

### TASK-009: WebRTC Proximity Handshake Broker
**Story:** US-005
**Type:** Backend
**Assigned to:** BE Dev
**Effort:** L
**Sprint:** 2
**Depends on:** TASK-003
**Description:** Program the signaling server forwarding `webrtc-offer`, `webrtc-answer`, and `webrtc-ice-candidate` packets between targeted socket sessions.

### TASK-010: Client WebRTC Proximity Engine
**Story:** US-005
**Type:** Frontend
**Assigned to:** FE Dev
**Effort:** L
**Sprint:** 2
**Depends on:** TASK-005
**Description:** Implement RTCPeerConnection setups on clients. Program distance calculations to trigger handshakes when distance is <= 150px (BR-003).

### TASK-011: Private Zone Rooms Connection Isolation
**Story:** US-006
**Type:** Frontend
**Assigned to:** FE Dev
**Effort:** L
**Sprint:** 2
**Depends on:** TASK-010
**Description:** Render neon borders for Meeting Rooms. Check if player position triggers a room entry event. Isolate WebRTC handshakes to players sharing the zoneId.

### TASK-012: Spatial Sound Attenuation Curve
**Story:** US-007
**Type:** Frontend
**Assigned to:** FE Dev
**Effort:** M
**Sprint:** 2
**Depends on:** TASK-010
**Description:** Implement client audio track volume controls adjusting volume output dynamically based on distance ratio.

### TASK-013: Interactive Objects Modals
**Story:** US-009
**Type:** Frontend
**Assigned to:** FE Dev
**Effort:** M
**Sprint:** 2
**Depends on:** TASK-005
**Description:** Render TV and whiteboard interactive assets. Detect "E" key input in range and display iframe modal. Auto-close if player moves away.

### TASK-014: UAT & Integration Tests
**Story:** All US stories
**Type:** Testing
**Assigned to:** Tester
**Effort:** M
**Sprint:** 2
**Depends on:** TASK-011
**Description:** Design end-to-end UAT test plans, run manual client integration tests on localhost port, and write unit tests for coordinate logic.
