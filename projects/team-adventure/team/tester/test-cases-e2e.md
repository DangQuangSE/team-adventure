# End-to-End Test Cases — Virtual Office MVP

## End-to-End Test Cases

### TC-E2E-001: WebRTC Proximity Call Establishment
- **Objective:** Verify two players walk into proximity and successfully trigger a WebRTC connection.
- **Preconditions:** Player A and Player B have spawned in the lobby. Both have camera and mic permissions active.
- **Execution steps:**
  1. Player A uses WASD to walk close to Player B until the distance is <= 150px.
  2. Verify that client-side distance check calls `initiateWebRTCPeer()`.
  3. Verify that `webrtc-offer` is sent through sockets, followed by `webrtc-answer` and ICE exchanges.
  4. Check that both players show each other's live video in the sidebar.
  5. Check that the proximity call count displays "1 Proximity Call".
- **Expected Outcome:** Direct WebRTC P2P media stream connects successfully. Pass.

### TC-E2E-002: WebRTC Proximity Call Teardown
- **Objective:** Verify call disconnects when players walk apart.
- **Preconditions:** Player A and Player B are in an active proximity call.
- **Execution steps:**
  1. Player A walks away from Player B until the distance is > 150px.
  2. Verify that the distance tick detects threshold breach.
  3. Verify that clients trigger `closeWebRTCPeer()`.
  4. Verify that the remote video element is removed from the sidebar on both clients.
- **Expected Outcome:** Call session is closed, resources are released. Pass.

### TC-E2E-003: Meeting Room Call Isolation
- **Objective:** Verify meeting room limits connections only to players in the same zone.
- **Preconditions:** Player A and Player B are inside "Meeting Room 1". Player C is in the lobby outside the room.
- **Execution steps:**
  1. Verify Player A and Player B have established WebRTC connections.
  2. Verify Player C has no active connections (0 Proximity Calls) even if they stand close to the room border (e.g. 50px away).
  3. Player B walks out of "Meeting Room 1" into the lobby.
  4. Verify Player B's connection to Player A is closed.
- **Expected Outcome:** WebRTC streams are constrained strictly by zone boundaries. Pass.
