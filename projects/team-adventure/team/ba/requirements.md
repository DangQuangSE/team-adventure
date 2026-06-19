# Requirements — Virtual Office MVP

## Executive Summary

The Virtual Office MVP is a 2D real-time collaborative workspace designed to simulate a physical office environment for remote teams. By combining a 2D top-down game world (developed using Phaser 3) with real-time proximity-based voice and video chat (using WebRTC and Socket.io), the system allows team members to interact naturally by walking up to each other, joining private meeting rooms, and collaborating on shared interactive tools.

## Problem Statement

Remote teams often suffer from a lack of spontaneous interaction, isolation, and collaboration friction. Traditional video conferencing tools require scheduling meetings, which discourages casual, unstructured chats (the "watercooler effect"). The cost of this friction is reduced team cohesion, slower decision-making, and lower employee engagement. The Virtual Office MVP solves this by providing a continuous, spatial workspace where starting a conversation is as simple as walking next to a colleague.

## Requirements

- **REQ-01**: The system shall spawn a new player at a randomized coordinates near the lobby entrance when they connect with a display name and chosen avatar style.
- **REQ-02**: The system shall track and synchronize player coordinates (x, y) and facing direction across all connected clients in real-time (aiming for less than 50ms latency).
- **REQ-03**: The system shall broadcast player status updates ('working' | 'meeting' | 'away') to all online players.
- **REQ-04**: The system shall broadcast player camera (on/off) and microphone (mute/unmute) toggle states to all online players.
- **REQ-05**: The system shall automatically initiate P2P WebRTC audio/video streams between players when they are in public spaces and within a proximity threshold of 150 pixels.
- **REQ-06**: The system shall isolate audio/video communication inside designated private zones (meeting rooms), meaning players inside the zone only connect to others in the same zone, and players outside cannot hear or see them.
- **REQ-07**: The system shall automatically tear down WebRTC P2P connections when players move beyond the 150-pixel proximity threshold or leave the same private zone.
- **REQ-08**: The system shall provide a synchronized collaborative notepad that updates in real-time for all players editing it.
- **REQ-09**: The system shall detect player proximity to interactive objects (like whiteboards or TV screens) and prompt the user to interact by pressing 'E', opening a web application frame or collaborative tool.
- **REQ-10**: The system shall dynamically calculate physical distance between connected players and adjust remote audio playback volume to simulate spatial sound.

## Actors

| Actor | Role | Technical Proficiency | Frequency of Use | Data Access |
| ----- | ---- | --------------------- | ---------------- | ----------- |
| Team Member | General user who moves around, communicates, and collaborates. | Basic | Daily | Read/Write (Self state, Shared Notes) |
| Administrator | System manager (future role to configure office layouts, rooms). | Intermediate | Occasional | Full Admin |

## In Scope

- 2D visual representation of players moving around using Phaser 3.
- Socket.io server to coordinate positioning and state.
- WebRTC broker server for establishing P2P media connections.
- Proximity-based audio/video triggers (150px threshold).
- Private rooms (Meeting Room 1 and Meeting Room 2) with boundary neon lines and isolated calling.
- Synced collaborative text editor.
- Embedded interactive objects (Excalidraw, YouTube Lounge).

## Out of Scope

- User persistence and historical database (all data is in-memory for MVP).
- File sharing and custom document uploads.
- Custom room layouts creation by users (currently hardcoded maps).
- Advanced administration panel.

## Assumptions

- **Assumption 1**: Users have a stable internet connection with sufficient upload/download speeds to handle multiple WebRTC streams simultaneously.
  * *Risk if wrong:* High latency, voice/video stuttering, or failure to establish peer connections.
- **Assumption 2**: Users grant microphone and camera permissions to their web browser.
  * *Risk if wrong:* System falls back to dummy streams, limiting the core proximity feature.
- **Assumption 3**: STUN servers provided by Google are accessible and resolve network addresses correctly.
  * *Risk if wrong:* Peer connections fail to traverse NATs/firewalls.

## Conflicts Detected

None detected.

## Flags from Previous Agents

No flags detected.
