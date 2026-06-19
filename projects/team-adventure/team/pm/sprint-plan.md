# Sprint Plan — Virtual Office MVP

## Sprint Overview

| Sprint | Goal | Stories | Story Points | Duration |
| --- | --- | --- | --- | --- |
| Sprint 1 | Core Workspace Framework, Spawning, Movement & Note Collaboration | US-001, US-002, US-003, US-004, US-008 | 9 pts | 2 weeks |
| Sprint 2 | WebRTC Spatial Proximity Communications & Interactive Objects | US-005, US-006, US-007, US-009 | 16 pts | 2 weeks |

**Total sprints:** 2
**Total story points:** 25
**Estimated duration:** 4 weeks

## Sprint 1

**Goal:** Establish the core multiplayer 2D workspace world, synchronized movement, player state controls (camera/mic/status), and real-time collaborative note-taking.
**Stories included:**
- US-001: Spawn player with display name and avatar style [Essential] — 1 pts
- US-002: Player movement inside the game world [Essential] — 3 pts
- US-003: Toggle camera and microphone state [Essential] — 1 pts
- US-004: Update player status indicator [Essential] — 1 pts
- US-008: Real-time synchronized collaborative notepad [Essential] — 3 pts

**Definition of Done:**
- All acceptance criteria pass.
- Clean Architecture code layers implemented.
- Linting and verification scripts pass.
- Artifacts written to `projects/team-adventure/team/`.

## Sprint 2

**Goal:** Integrate the WebRTC peer connection framework to support proximity-based video calling, spatial sound attenuation, private room isolation, and keyboard-driven interactive objects.
**Stories included:**
- US-005: Proximity-based audio/video peer connection [Essential] — 5 pts
- US-006: Private zone meeting call isolation [Essential] — 5 pts
- US-007: Spatial sound volume attenuation [Conditional] — 3 pts
- US-009: Interactive whiteboard and TV object integrations [Essential] — 3 pts

**Definition of Done:**
- All acceptance criteria pass.
- Proximity sound math behaves continuously.
- Safe device fallbacks resolve connection handshakes.
- QA sign-off complete.
