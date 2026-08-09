package com.ywes.application_tracker.dto;

import com.ywes.application_tracker.model.JobApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record JobApplicationMutation(
        @NotBlank(message = "Company is mandatory")
        @Size(max = 255, message = "Company can have a maximum of 255 letters")
        String company,

        @NotBlank(message = "Role is mandatory")
        @Size(max = 255, message = "Role can have a maximum of 255 letters")
        String role,

        @NotNull(message = "Status is mandatory")
        JobApplicationStatus status,

        String notes,

        @Size(max = 2048, message = "Url can have a maximum of 2048 letters")
        String jobPostingUrl
) { }
