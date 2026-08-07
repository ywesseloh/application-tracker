package com.ywes.application_tracker.dto;

import com.ywes.application_tracker.model.JobApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JobApplicationMutation {
    @NotBlank(message = "Company is mandatory")
    @Size(max = 255, message = "Company can have a maximum of 255 letters")
    private String company;

    @NotBlank(message = "Role is mandatory")
    @Size(max = 255, message = "Role can have a maximum of 255 letters")
    private String role;

    @NotNull(message = "Status is mandatory")
    private JobApplicationStatus status;

    private String notes;

    @Size(max = 2048, message = "Url can have a maximum of 2048 letters")
    private String jobPostingUrl;
}
