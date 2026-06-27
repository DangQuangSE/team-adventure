# Team Adventure Backend

Spring Boot backend for the virtual office realtime layer.

## Run

```bash
mvn spring-boot:run
```

## Test

```bash
mvn test
```

## WebSocket API

Endpoint:

```text
ws://localhost:8080/ws/office
```

Message envelope:

```json
{
  "type": "join-office",
  "payload": {}
}
```

Supported client message types:

- `join-office`
- `player-movement`
- `change-status`
- `change-media`
- `change-zone`
- `edit-note`
- `webrtc-offer`
- `webrtc-answer`
- `webrtc-ice-candidate`
- `webrtc-disconnect`

The backend is intentionally in-memory for this first clean architecture pass.
