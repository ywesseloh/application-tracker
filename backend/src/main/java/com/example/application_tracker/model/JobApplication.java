package com.example.application_tracker.model;

import com.example.application_tracker.dto.JobApplicationDTO;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class JobApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @NotBlank(message="Company is mandatory")
    private String company;
    @NotBlank(message="Role is mandatory")
    private String role;
    @NotNull(message="Status is mandatory")
    @Enumerated(EnumType.STRING)
    private JobApplicationStatus status;
    @NotNull(message="Column position is mandatory")
    private Integer columnPosition;
    private String notes;
    private String jobPostingUrl;

    public static JobApplication fromJobApplicationDTO(JobApplicationDTO jobApplicationDTO, Integer id, int columnCount) {
        return new JobApplication(
            id,
            jobApplicationDTO.getCompany(),
            jobApplicationDTO.getRole(),
            jobApplicationDTO.getStatus(),
            columnCount,
            jobApplicationDTO.getNotes(),
            jobApplicationDTO.getJobPostingUrl()
        );
    }
}
