package com.teamadventure.realtime.dto;

public record ServerMessage(String type, Object payload) {

  public static ServerMessage of(String type, Object payload) {
    return new ServerMessage(type, payload);
  }
}
