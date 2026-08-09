package com.ywes.application_tracker.model;

import com.ywes.application_tracker.dto.JobApplicationMutation;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.util.Date;

@Entity
@Data
@NoArgsConstructor
public class JobApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(length = 255, nullable = false)
    private String company;

    @Column(length = 255, nullable = false)
    private String role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobApplicationStatus status;

    private String notes;

    @Column(length = 2048)
    private String jobPostingUrl;

    @OneToOne(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private BoardPlacement placement;

    @CreationTimestamp
    @Column(updatable = false, name = "created_at")
    private Date createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Date updatedAt;

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
                jobApplicationMutation.company(),
                jobApplicationMutation.role(),
                jobApplicationMutation.status(),
                jobApplicationMutation.notes(),
                jobApplicationMutation.jobPostingUrl()
        );
    }
}
