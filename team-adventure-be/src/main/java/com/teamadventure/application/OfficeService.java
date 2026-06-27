package com.teamadventure.application;

import com.teamadventure.domain.model.AvatarStyle;
import com.teamadventure.domain.model.Player;
import com.teamadventure.domain.model.PlayerStatus;
import com.teamadventure.domain.model.Position;
import com.teamadventure.domain.repository.PlayerRepository;
import java.util.Collection;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicReference;
import org.springframework.stereotype.Service;

@Service
public class OfficeService {
  private static final String DEFAULT_NOTE = """
      Team Adventure Office

      Daily rhythm:
      - Check in at the lobby
      - Move to your desk for focus work
      - Walk into rooms for meetings
      - Use the lounge for casual conversations
      """;

  private final PlayerRepository playerRepository;
  private final AtomicReference<String> sharedNote = new AtomicReference<>(DEFAULT_NOTE);

  public OfficeService(PlayerRepository playerRepository) {
    this.playerRepository = playerRepository;
  }

  public Player join(String sessionId, String name, String avatarStyle) {
    int x = 420 + ThreadLocalRandom.current().nextInt(-24, 25);
    int y = 360 + ThreadLocalRandom.current().nextInt(-24, 25);
    Player player = new Player(
        sessionId,
        name,
        AvatarStyle.from(avatarStyle),
        new Position(x, y, Position.Direction.DOWN)
    );
    return playerRepository.save(player);
  }

  public Optional<Player> move(String id, int x, int y, String direction) {
    return playerRepository.findById(id).map(player -> {
      player.moveTo(new Position(x, y, Position.Direction.from(direction)));
      return playerRepository.save(player);
    });
  }

  public Optional<Player> changeStatus(String id, String rawStatus) {
    return playerRepository.findById(id).map(player -> {
      player.changeStatus(PlayerStatus.from(rawStatus));
      return playerRepository.save(player);
    });
  }

  public Optional<Player> updateMedia(String id, boolean muted, boolean cameraOff) {
    return playerRepository.findById(id).map(player -> {
      player.updateMedia(muted, cameraOff);
      return playerRepository.save(player);
    });
  }

  public Optional<Player> enterZone(String id, String zoneId) {
    return playerRepository.findById(id).map(player -> {
      player.enterZone(zoneId);
      return playerRepository.save(player);
    });
  }

  public String updateNote(String text) {
    sharedNote.set(text == null ? "" : text);
    return sharedNote.get();
  }

  public String currentNote() {
    return sharedNote.get();
  }

  public Collection<Player> players() {
    return playerRepository.findAll();
  }

  public Optional<Player> disconnect(String id) {
    return playerRepository.remove(id);
  }
}
