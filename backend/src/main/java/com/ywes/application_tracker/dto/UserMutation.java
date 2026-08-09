package com.ywes.application_tracker.dto;

import jakarta.persistence.Column;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UserMutation(
        @NotNull(message = "Username is mandatory")
        @Size(max = 20, message = "Username can have a maximum of 20 characters")
        String username,

        @NotNull(message = "Password is mandatory")
        @Size(max = 20, message = "Password can have a maximum of 20 characters")
        String password
) { }
