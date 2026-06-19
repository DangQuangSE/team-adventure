# Technology Stack — Virtual Office MVP

## Frontend

| Layer | Selected | Version | Rationale |
| --- | --- | --- | --- |
| Framework | Vanilla HTML5/CSS3/JS | N/A | Simplest architecture for a game client; avoids bundle overhead and transpilation issues. |
| Game Engine | Phaser 3 | 3.60.0 | Highly optimized canvas/WebGL library for 2D sprite rendering, collision detection, and coordinate management. |
| Icons | FontAwesome | 6.4.0 | Extensive, clean icon library for UI controls (microphone, video camera, whiteboard tabs). |
| Real-time Socket | Socket.io Client | 4.7.5 | Reliable real-time communication wrapper for WebSockets with fallback support. |
| WebRTC Interface | Native browser WebRTC API | N/A | Built-in browser support for low-latency P2P audio and video streaming. |

## Backend

| Layer | Selected | Version | Rationale |
| --- | --- | --- | --- |
| Runtime | Node.js | 20.x | Large developer ecosystem, async event-driven runtime ideal for real-time WebSockets. |
| Framework | Express | 4.19.2 | Lightweight, unopinionated framework for hosting static frontend client files. |
| Real-time Socket | Socket.io Server | 4.7.5 | Robust signaling server out-of-the-box, providing connection states and room namespaces. |
| Environment | dotenv | 16.4.5 | Manages application environment variables (ports, node environment). |

## Database

| Layer | Selected | Version | Rationale |
| --- | --- | --- | --- |
| Primary DB | In-Memory Object Store | N/A | High performance, simple. No persistent storage is required for this MVP (player positions are ephemeral). |
| Cache | None | N/A | Ephemeral state size is small enough to fit directly in Node.js process memory. |

## Infrastructure

| Layer | Selected | Rationale |
| --- | --- | --- |
| Hosting | Local Dev Server / Render | Easy deployment of Node.js services; support for WebSockets. |
| CI/CD | GitHub Actions | Automatable linting and checking of code style on pull requests. |
| WebRTC STUN/TURN | Google STUN | Free and accessible STUN servers for NAT traversal during local/staging tests. |

## Rejected Alternatives

| Alternative | Layer | Reason rejected |
| --- | --- | --- |
| React / Next.js | Frontend | Creates unnecessary bundling complexity for canvas-based game loops. Vanilla JS is much easier to hook directly into Phaser 3 lifecycle methods. |
| Python / FastAPI | Backend | Node.js has native, first-class Socket.io libraries which are significantly more performant and easier to setup for dual-way WebSocket connections than python socket-io equivalents. |
| PostgreSQL | Database | Writing ephemeral, high-frequency coordinate changes (every 45ms per user) to a relational disk-based database introduces unnecessary disk I/O and latency bottlenecks. |
| WebRTC Media Server (Kurento/SFU) | WebRTC | A centralized SFU/MCU (Media Server) increases hosting cost and architectural complexity. Standard Mesh P2P is sufficient for MVP scale (<10 concurrent users in proximity). |
