package com.ywes.application_tracker.dto;

public record LoginResponse(String jwt, String refreshToken) {
}
