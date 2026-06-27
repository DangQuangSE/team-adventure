package com.teamadventure.domain.model;

import java.util.Arrays;

public enum AvatarStyle {
  DEV_BLUE("dev-blue"),
  DESIGN_PURPLE("design-purple"),
  MANAGER_ORANGE("manager-orange"),
  QA_GREEN("qa-green");

  private final String value;

  AvatarStyle(String value) {
    this.value = value;
  }

  public String value() {
    return value;
  }

  public static AvatarStyle from(String raw) {
    return Arrays.stream(values())
        .filter(style -> style.value.equalsIgnoreCase(raw))
        .findFirst()
        .orElse(DEV_BLUE);
  }
}
