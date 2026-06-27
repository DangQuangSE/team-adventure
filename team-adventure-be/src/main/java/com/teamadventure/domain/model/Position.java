package com.teamadventure.domain.model;

public record Position(int x, int y, Direction direction) {

  public enum Direction {
    DOWN, LEFT, RIGHT, UP;

    public static Direction from(String raw) {
      if (raw == null || raw.isBlank()) {
        return DOWN;
      }
      try {
        return Direction.valueOf(raw.trim().toUpperCase());
      } catch (IllegalArgumentException ignored) {
        return DOWN;
      }
    }

    public String value() {
      return name().toLowerCase();
    }
  }
}
