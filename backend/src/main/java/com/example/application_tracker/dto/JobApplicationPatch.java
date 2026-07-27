package com.example.application_tracker.dto;

import com.example.application_tracker.model.JobApplicationStatus;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JobApplicationPatch {
    @NotNull(message="Status is mandatory")
    @Enumerated(EnumType.STRING)
    private JobApplicationStatus status;
    @NotNull(message="Column position is mandatory")
    private Integer columnPosition;
}
