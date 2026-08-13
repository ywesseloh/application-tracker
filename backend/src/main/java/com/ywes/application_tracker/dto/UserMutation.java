package com.ywes.application_tracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserMutation(
        @NotBlank(message = "Username is mandatory")
        @Size(max = 20, message = "Username can have a maximum length of 20 characters")
        String username,

        @NotBlank(message = "Password is mandatory")
        @Size(max = 20, message = "Password can have a maximum length of 20 characters")
        String password
) { }
