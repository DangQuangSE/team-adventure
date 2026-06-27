package com.teamadventure.domain.repository;

import com.teamadventure.domain.model.Player;
import java.util.Collection;
import java.util.Optional;

public interface PlayerRepository {
  Player save(Player player);

  Optional<Player> findById(String id);

  Collection<Player> findAll();

  Optional<Player> remove(String id);
}
