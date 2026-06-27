package com.teamadventure.realtime.dto;

import com.teamadventure.domain.model.Player;
import java.time.Instant;

public record PlayerView(
    String id,
    String name,
    String avatarStyle,
    int x,
    int y,
    String direction,
    String status,
    boolean muted,
    boolean cameraOff,
    String zoneId,
    Instant lastSeenAt
) {

  public static PlayerView from(Player player) {
    return new PlayerView(
        player.id(),
        player.name(),
        player.avatarStyle().value(),
        player.position().x(),
        player.position().y(),
        player.position().direction().value(),
        player.status().value(),
        player.muted(),
        player.cameraOff(),
        player.zoneId(),
        player.lastSeenAt()
    );
  }
}
