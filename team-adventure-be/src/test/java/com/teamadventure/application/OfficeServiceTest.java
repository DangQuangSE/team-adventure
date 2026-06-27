package com.teamadventure.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.teamadventure.domain.model.PlayerStatus;
import com.teamadventure.infrastructure.persistence.InMemoryPlayerRepository;
import org.junit.jupiter.api.Test;

class OfficeServiceTest {

  @Test
  void joinsAndMovesPlayer() {
    OfficeService service = new OfficeService(new InMemoryPlayerRepository(), new ObjectMapper());

    var player = service.join("session-1", "Corn", "qa-green");
    var moved = service.move(player.id(), 100, 200, "left");

    assertThat(moved).isPresent();
    assertThat(moved.get().position().x()).isEqualTo(100);
    assertThat(moved.get().position().direction().value()).isEqualTo("left");
  }

  @Test
  void defaultsInvalidStatusToWorking() {
    OfficeService service = new OfficeService(new InMemoryPlayerRepository(), new ObjectMapper());
    var player = service.join("session-1", "Corn", "dev-blue");

    var changed = service.changeStatus(player.id(), "unknown");

    assertThat(changed).isPresent();
    assertThat(changed.get().status()).isEqualTo(PlayerStatus.WORKING);
  }

  @Test
  void storesBoardById() {
    OfficeService service = new OfficeService(new InMemoryPlayerRepository(), new ObjectMapper());
    var scene = new ObjectMapper().createObjectNode().put("type", "excalidraw");

    var board = service.updateBoard("project-board", scene, 7);

    assertThat(board.boardId()).isEqualTo("project-board");
    assertThat(board.version()).isEqualTo(7);
    assertThat(service.board("project-board").scene().path("type").asText()).isEqualTo("excalidraw");
  }
}
