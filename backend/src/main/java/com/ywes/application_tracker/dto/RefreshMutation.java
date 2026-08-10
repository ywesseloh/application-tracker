package com.ywes.application_tracker.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.NonNull;

public record RefreshMutation(
        @NotBlank(message = "Refresh token is mandatory")
        String refreshToken
) {
}
