package com.ywes.application_tracker.dto;

public record AuthTokenPair(String jwt, String rawRefreshToken) {
}
