package com.ywes.application_tracker.dto;

import com.ywes.application_tracker.model.JobApplicationStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JobApplicationPatch {
    @NotNull(message = "Status is mandatory")
    private JobApplicationStatus status;

    @Min(value = 0, message = "Position must be zero or greater")
    private Integer columnPosition;
}
