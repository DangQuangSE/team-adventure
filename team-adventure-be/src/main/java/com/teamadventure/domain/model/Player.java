package com.teamadventure.domain.model;

import java.time.Instant;
import java.util.Objects;

public final class Player {
  private final String id;
  private final String name;
  private final AvatarStyle avatarStyle;
  private Position position;
  private PlayerStatus status;
  private boolean muted;
  private boolean cameraOff;
  private String zoneId;
  private Instant lastSeenAt;

  public Player(String id, String name, AvatarStyle avatarStyle, Position position) {
    this.id = Objects.requireNonNull(id);
    this.name = normalizeName(name, id);
    this.avatarStyle = avatarStyle == null ? AvatarStyle.DEV_BLUE : avatarStyle;
    this.position = position == null ? new Position(420, 360, Position.Direction.DOWN) : position;
    this.status = PlayerStatus.WORKING;
    this.lastSeenAt = Instant.now();
  }

  public String id() {
    return id;
  }

  public String name() {
    return name;
  }

  public AvatarStyle avatarStyle() {
    return avatarStyle;
  }

  public Position position() {
    return position;
  }

  public PlayerStatus status() {
    return status;
  }

  public boolean muted() {
    return muted;
  }

  public boolean cameraOff() {
    return cameraOff;
  }

  public String zoneId() {
    return zoneId;
  }

  public Instant lastSeenAt() {
    return lastSeenAt;
  }

  public void moveTo(Position nextPosition) {
    if (nextPosition != null) {
      this.position = nextPosition;
      touch();
    }
  }

  public void changeStatus(PlayerStatus nextStatus) {
    this.status = nextStatus == null ? PlayerStatus.WORKING : nextStatus;
    touch();
  }

  public void updateMedia(boolean muted, boolean cameraOff) {
    this.muted = muted;
    this.cameraOff = cameraOff;
    touch();
  }

  public void enterZone(String zoneId) {
    this.zoneId = (zoneId == null || zoneId.isBlank()) ? null : zoneId;
    touch();
  }

  private void touch() {
    this.lastSeenAt = Instant.now();
  }

  private static String normalizeName(String raw, String id) {
    if (raw == null || raw.isBlank()) {
      return "Guest " + id.substring(0, Math.min(4, id.length()));
    }
    return raw.trim().substring(0, Math.min(32, raw.trim().length()));
  }
}
