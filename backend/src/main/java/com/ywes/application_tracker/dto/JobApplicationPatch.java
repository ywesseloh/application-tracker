package com.ywes.application_tracker.dto;

import com.ywes.application_tracker.model.JobApplicationStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record JobApplicationPatch(
        @NotNull(message = "Status is mandatory")
        JobApplicationStatus status,

        @Min(value = 0, message = "Position must be zero or greater")
        Integer columnPosition
) { }
