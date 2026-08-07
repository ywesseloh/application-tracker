package com.ywes.application_tracker.model;

import com.ywes.application_tracker.dto.JobApplicationMutation;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class JobApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @NotBlank(message = "Company is mandatory")
    @Size(max = 255, message = "Company can have a maximum of 255 letters")
    @Column(length = 255)
    private String company;
    @NotBlank(message = "Role is mandatory")
    @Size(max = 255, message = "Role can have a maximum of 255 letters")
    @Column(length = 255)
    private String role;
    @NotNull(message = "Status is mandatory")
    @Enumerated(EnumType.STRING)
    private JobApplicationStatus status;
    private String notes;
    @Size(max = 2048, message = "Url can have a maximum of 2048 letters")
    @Column(length = 2048)
    private String jobPostingUrl;

    @OneToOne(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private BoardPlacement placement;

    public JobApplication(
            Integer id,
            String company,
            String role,
            JobApplicationStatus status,
            String notes,
            String jobPostingUrl
    ) {
        this.id = id;
        this.company = company;
        this.role = role;
        this.status = status;
        this.notes = notes;
        this.jobPostingUrl = jobPostingUrl;
    }

    public static JobApplication fromJobApplicationMutation(
            JobApplicationMutation jobApplicationMutation,
            Integer id
    ) {
        return new JobApplication(
                id,
                jobApplicationMutation.getCompany(),
                jobApplicationMutation.getRole(),
                jobApplicationMutation.getStatus(),
                jobApplicationMutation.getNotes(),
                jobApplicationMutation.getJobPostingUrl()
        );
    }
}
