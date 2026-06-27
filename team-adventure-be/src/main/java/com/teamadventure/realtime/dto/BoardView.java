package com.teamadventure.realtime.dto;

import com.fasterxml.jackson.databind.JsonNode;

public record BoardView(String boardId, JsonNode scene, long version) {
}
