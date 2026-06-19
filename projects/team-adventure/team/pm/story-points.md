# Story Points — Virtual Office MVP

## Velocity Estimate

**Assumed velocity:** 15 story points per sprint
**Basis:** Medium-complexity real-time project with 2 development agents (1 backend dev, 1 frontend dev) and a 2-week sprint cycle.
**Sprint count:** 2 sprints

## Story Points Summary

| Story | Title | Priority | Points | Sprint | Tasks |
| --- | --- | --- | --- | --- | --- |
| US-001 | Spawn player with display name and avatar style | Essential | 1 | 1 | TASK-001, TASK-004 |
| US-002 | Player movement inside the game world | Essential | 3 | 1 | TASK-003, TASK-005 |
| US-003 | Toggle camera and microphone state | Essential | 1 | 1 | TASK-006 |
| US-004 | Update player status indicator | Essential | 1 | 1 | TASK-006 |
| US-005 | Proximity-based audio/video peer connection | Essential | 5 | 2 | TASK-009, TASK-010 |
| US-006 | Private zone meeting call isolation | Essential | 5 | 2 | TASK-011 |
| US-007 | Spatial sound volume attenuation | Conditional | 3 | 2 | TASK-012 |
| US-008 | Real-time synchronized collaborative notepad | Essential | 3 | 1 | TASK-007, TASK-008 |
| US-009 | Interactive whiteboard and TV object integrations | Essential | 3 | 2 | TASK-013 |

## Task Points Detail

| Task | Title | Type | Size | Points | Sprint |
| --- | --- | --- | --- | --- | --- |
| TASK-001 | Setup Express & Socket.io Server Framework | Backend | S | 1 | 1 |
| TASK-002 | Implement In-Memory Player Repository | Database | M | 3 | 1 |
| TASK-003 | Player Spawning & Movement Sync API | Backend | M | 3 | 1 |
| TASK-004 | Build Phaser 3 Lobby UI | Frontend | S | 1 | 1 |
| TASK-005 | Phaser 3 Game World and Movements | Frontend | M | 3 | 1 |
| TASK-006 | Media controls & Status drop-down sync | Frontend | S | 1 | 1 |
| TASK-007 | Collaborative Notepad Sync Backend | Backend | M | 3 | 1 |
| TASK-008 | Client-side Sync Notepad UI | Frontend | M | 3 | 1 |
| TASK-009 | WebRTC Proximity Handshake Broker | Backend | L | 5 | 2 |
| TASK-010 | Client WebRTC Proximity Engine | Frontend | L | 5 | 2 |
| TASK-011 | Private Zone Rooms Connection Isolation | Frontend | L | 5 | 2 |
| TASK-012 | Spatial Sound Attenuation Curve | Frontend | M | 3 | 2 |
| TASK-013 | Interactive Objects Modals | Frontend | M | 3 | 2 |
| TASK-014 | UAT & Integration Tests | Testing | M | 3 | 2 |

**Sprint totals:**
| Sprint | Story Points | Tasks |
| --- | --- | --- |
| Sprint 1 | 18 | 8 |
| Sprint 2 | 26 | 6 |
| **Total** | **44** | **14** |
