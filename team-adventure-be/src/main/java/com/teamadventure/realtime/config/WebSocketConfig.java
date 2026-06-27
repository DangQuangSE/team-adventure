package com.teamadventure.realtime.config;

import com.teamadventure.realtime.OfficeWebSocketHandler;
import java.util.Arrays;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
  private final OfficeWebSocketHandler handler;
  private final String[] allowedOrigins;

  public WebSocketConfig(
      OfficeWebSocketHandler handler,
      @Value("${team-adventure.cors.allowed-origins}") String allowedOrigins
  ) {
    this.handler = handler;
    this.allowedOrigins = Arrays.stream(allowedOrigins.split(","))
        .map(String::trim)
        .filter(origin -> !origin.isBlank())
        .toArray(String[]::new);
  }

  @Override
  public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
    registry.addHandler(handler, "/ws/office")
        .setAllowedOrigins(allowedOrigins);
  }
}
