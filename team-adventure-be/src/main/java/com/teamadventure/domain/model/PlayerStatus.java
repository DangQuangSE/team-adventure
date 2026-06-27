package com.teamadventure.domain.model;

import java.util.Arrays;

public enum PlayerStatus {
  WORKING("working"),
  FOCUSING("focusing"),
  MEETING("meeting"),
  AWAY("away");

  private final String value;

  PlayerStatus(String value) {
    this.value = value;
  }

  public String value() {
    return value;
  }

  public static PlayerStatus from(String raw) {
    return Arrays.stream(values())
        .filter(status -> status.value.equalsIgnoreCase(raw))
        .findFirst()
        .orElse(WORKING);
  }
}
