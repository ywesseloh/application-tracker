package com.example.application_tracker.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(uniqueConstraints = { @UniqueConstraint(
        name = "uc_status_position",
        columnNames = { "status", "position" })
})
public class BoardPlacement {
    @Id
    private Integer applicationId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "application_id")
    private JobApplication application;

    @NotNull
    @Enumerated(EnumType.STRING)
    private JobApplicationStatus status;

    @NotNull
    @Min(value = 0, message = "Position must be positive")
    private Integer position;

    public BoardPlacement(
            JobApplication application,
            JobApplicationStatus status,
            Integer position
    ) {
        this.application = application;
        this.status = status;
        this.position = position;
    }
}
