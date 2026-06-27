package com.teamadventure.infrastructure.persistence;

import com.teamadventure.domain.model.Player;
import com.teamadventure.domain.repository.PlayerRepository;
import java.util.Collection;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Repository;

@Repository
public class InMemoryPlayerRepository implements PlayerRepository {
  private final ConcurrentHashMap<String, Player> players = new ConcurrentHashMap<>();

  @Override
  public Player save(Player player) {
    players.put(player.id(), player);
    return player;
  }

  @Override
  public Optional<Player> findById(String id) {
    return Optional.ofNullable(players.get(id));
  }

  @Override
  public Collection<Player> findAll() {
    return players.values();
  }

  @Override
  public Optional<Player> remove(String id) {
    return Optional.ofNullable(players.remove(id));
  }
}
