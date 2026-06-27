package com.teamadventure.realtime;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.teamadventure.application.OfficeService;
import com.teamadventure.domain.model.Player;
import com.teamadventure.realtime.dto.ClientMessage;
import com.teamadventure.realtime.dto.OfficeStateView;
import com.teamadventure.realtime.dto.PlayerView;
import com.teamadventure.realtime.dto.ServerMessage;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
public class OfficeWebSocketHandler extends TextWebSocketHandler {
  private static final Logger log = LoggerFactory.getLogger(OfficeWebSocketHandler.class);

  private final ObjectMapper objectMapper;
  private final OfficeService officeService;
  private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

  public OfficeWebSocketHandler(ObjectMapper objectMapper, OfficeService officeService) {
    this.objectMapper = objectMapper;
    this.officeService = officeService;
  }

  @Override
  public void afterConnectionEstablished(WebSocketSession session) {
    sessions.put(session.getId(), session);
    log.info("WebSocket connected: {}", session.getId());
  }

  @Override
  protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
    ClientMessage clientMessage = objectMapper.readValue(message.getPayload(), ClientMessage.class);
    switch (clientMessage.type()) {
      case "join-office" -> handleJoin(session, clientMessage.payload());
      case "player-movement" -> handleMovement(session, clientMessage.payload());
      case "change-status" -> handleStatus(session, clientMessage.payload());
      case "change-media" -> handleMedia(session, clientMessage.payload());
      case "change-zone" -> handleZone(session, clientMessage.payload());
      case "edit-note" -> handleNote(session, clientMessage.payload());
      case "open-board" -> handleOpenBoard(session, clientMessage.payload());
      case "update-board" -> handleUpdateBoard(session, clientMessage.payload());
      case "webrtc-offer", "webrtc-answer", "webrtc-ice-candidate", "webrtc-disconnect" ->
          forwardToPeer(session, clientMessage.type(), clientMessage.payload());
      default -> send(session, ServerMessage.of("error", Map.of("message", "Unknown message type")));
    }
  }

  @Override
  public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
    sessions.remove(session.getId());
    officeService.disconnect(session.getId())
        .ifPresent(player -> broadcast(ServerMessage.of("player-disconnected", Map.of("id", player.id()))));
    log.info("WebSocket disconnected: {}", session.getId());
  }

  private void handleJoin(WebSocketSession session, JsonNode payload) throws IOException {
    Player player = officeService.join(
        session.getId(),
        text(payload, "name"),
        text(payload, "avatarStyle")
    );

    List<PlayerView> players = officeService.players().stream().map(PlayerView::from).toList();
    send(session, ServerMessage.of(
        "office-state",
        new OfficeStateView(session.getId(), players, officeService.currentNote())
    ));
    broadcastExcept(session.getId(), ServerMessage.of("new-player", PlayerView.from(player)));
  }

  private void handleMovement(WebSocketSession session, JsonNode payload) throws IOException {
    officeService.move(
        session.getId(),
        intValue(payload, "x", 420),
        intValue(payload, "y", 360),
        text(payload, "direction")
    ).ifPresent(player -> broadcastExcept(session.getId(), ServerMessage.of("player-moved", PlayerView.from(player))));
  }

  private void handleStatus(WebSocketSession session, JsonNode payload) throws IOException {
    officeService.changeStatus(session.getId(), text(payload, "status"))
        .ifPresent(player -> broadcast(ServerMessage.of("player-status-changed", PlayerView.from(player))));
  }

  private void handleMedia(WebSocketSession session, JsonNode payload) throws IOException {
    officeService.updateMedia(
        session.getId(),
        boolValue(payload, "muted"),
        boolValue(payload, "cameraOff")
    ).ifPresent(player -> broadcast(ServerMessage.of("player-media-changed", PlayerView.from(player))));
  }

  private void handleZone(WebSocketSession session, JsonNode payload) throws IOException {
    officeService.enterZone(session.getId(), text(payload, "zoneId"))
        .ifPresent(player -> broadcast(ServerMessage.of("player-zone-changed", PlayerView.from(player))));
  }

  private void handleNote(WebSocketSession session, JsonNode payload) throws IOException {
    String note = officeService.updateNote(text(payload, "text"));
    broadcastExcept(session.getId(), ServerMessage.of("note-updated", Map.of("text", note)));
  }

  private void handleOpenBoard(WebSocketSession session, JsonNode payload) throws IOException {
    send(session, ServerMessage.of("board-state", officeService.board(text(payload, "boardId"))));
  }

  private void handleUpdateBoard(WebSocketSession session, JsonNode payload) {
    var board = officeService.updateBoard(
        text(payload, "boardId"),
        payload == null ? null : payload.path("scene"),
        longValue(payload, "version", System.currentTimeMillis())
    );
    broadcastExcept(session.getId(), ServerMessage.of("board-updated", board));
  }

  private void forwardToPeer(WebSocketSession session, String type, JsonNode payload) throws IOException {
    String targetId = text(payload, "targetId");
    WebSocketSession target = sessions.get(targetId);
    if (target == null || !target.isOpen()) {
      return;
    }
    send(target, ServerMessage.of(type, Map.of(
        "senderId", session.getId(),
        "data", payload.path("data")
    )));
  }

  private void broadcast(ServerMessage message) {
    for (WebSocketSession ws : sessions.values()) {
      try {
        send(ws, message);
      } catch (IOException exception) {
        log.warn("Failed to send message to session {}", ws.getId(), exception);
      }
    }
  }

  private void broadcastExcept(String excludedId, ServerMessage message) {
    for (WebSocketSession ws : sessions.values()) {
      if (!ws.getId().equals(excludedId)) {
        try {
          send(ws, message);
        } catch (IOException exception) {
          log.warn("Failed to send message to session {}", ws.getId(), exception);
        }
      }
    }
  }

  private void send(WebSocketSession session, ServerMessage message) throws IOException {
    if (session.isOpen()) {
      session.sendMessage(new TextMessage(objectMapper.writeValueAsString(message)));
    }
  }

  private static String text(JsonNode node, String field) {
    JsonNode value = node == null ? null : node.get(field);
    return value == null || value.isNull() ? null : value.asText();
  }

  private static int intValue(JsonNode node, String field, int fallback) {
    JsonNode value = node == null ? null : node.get(field);
    return value == null || !value.canConvertToInt() ? fallback : value.asInt();
  }

  private static boolean boolValue(JsonNode node, String field) {
    JsonNode value = node == null ? null : node.get(field);
    return value != null && value.asBoolean(false);
  }

  private static long longValue(JsonNode node, String field, long fallback) {
    JsonNode value = node == null ? null : node.get(field);
    return value == null || !value.canConvertToLong() ? fallback : value.asLong();
  }
}
