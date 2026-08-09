package com.ywes.application_tracker.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(uniqueConstraints = { @UniqueConstraint(
        name = "uc_user_status_position",
        columnNames = { "user_id", "status", "position" })
})
public class BoardPlacement {
    @Id
    private Integer applicationId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "application_id", nullable = false)
    private JobApplication application;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobApplicationStatus status;

    @Min(value = 0, message = "Position must be zero or greater")
    @Column(nullable = false)
    private Integer position;

    public BoardPlacement(
            JobApplication application,
            JobApplicationStatus status,
            Integer position,
            Integer userId
    ) {
        this.application = application;
        this.status = status;
        this.position = position;
        this.userId = userId;
    }
}
