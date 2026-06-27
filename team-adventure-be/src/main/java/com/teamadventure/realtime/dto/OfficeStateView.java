package com.teamadventure.realtime.dto;

import java.util.Collection;

public record OfficeStateView(String selfId, Collection<PlayerView> players, String sharedNote) {
}
