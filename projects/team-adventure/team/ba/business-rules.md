# Business Rules — Virtual Office MVP

## Business Rules

### BR-001: Player Display Name Constraints
**Rule:** Every player must specify a non-empty display name before spawning. The name must not exceed 15 characters.
**Applies to:** US-001
**Rationale:** Long usernames disrupt the HUD typography above player avatars and in the sidebar cards.

### BR-002: Client Movement Packet Throttling
**Rule:** Client movement packets (`player-movement` socket events) must be throttled to a minimum interval of 45 milliseconds.
**Applies to:** US-002
**Rationale:** Prevents network congestion on the server and socket buffer overflow under high player counts.

### BR-003: Proximity Connection Threshold
**Rule:** Two players in the public open office space shall only connect via WebRTC if the Euclidean distance between their avatars is less than or equal to 150 pixels.
**Applies to:** US-005, US-007
**Rationale:** Simulates a physical office layout where you can only speak to people close to you.

### BR-004: Private Zone Isolation Rule
**Rule:** When a player enters a private zone (e.g. `meeting_room_1` or `meeting_room_2`), their public proximity calculations are disabled. They will connect via WebRTC to *all* other players inside the same private zone, regardless of their distance, and *none* of the players outside it.
**Applies to:** US-006
**Rationale:** Private meeting rooms act as physical walls, preventing leakage of sound to outside and allowing team members to speak across the entire room.

### BR-005: Spatial Audio Volume Attenuation Formula
**Rule:** The playback volume of a remote peer's audio stream in public space must scale inversely with distance, according to the formula:
$$\text{Volume} = \max\left(0, 1 - \frac{\text{Distance}}{150}\right)$$
When inside a private room, the volume is set to a constant 1.0 (no attenuation).
**Applies to:** US-007
**Rationale:** Creates a natural audio falloff effect that mimics walking away from a speaker, while room-based calling should be clear.

### BR-006: Security Compliance for Generated Code (No Hardcoded Secrets)
**Rule:** No source code files (Backend or Frontend) shall contain hardcoded credentials, secret keys, password hashes, database passwords, API tokens, or direct server connection strings. All configuration parameters must be loaded via environment variables (`process.env`).
**Applies to:** All development tasks
**Rationale:** Protects production environments from credential leakage in git repositories.

### BR-007: Device Permission Fallback Policy
**Rule:** If a user denies webcam or microphone access, the system must create dummy media tracks (a silent audio track using Web Audio API and a black video frame track using canvas stream) to feed the peer connection, ensuring WebRTC negotations complete successfully.
**Applies to:** US-005
**Rationale:** Prevents connection failures and Javascript errors when a user joins as a spectator or audio-only player.
