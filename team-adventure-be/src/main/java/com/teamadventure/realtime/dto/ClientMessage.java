package com.teamadventure.realtime.dto;

import com.fasterxml.jackson.databind.JsonNode;

public record ClientMessage(String type, JsonNode payload) {
}
