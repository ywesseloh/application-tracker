package com.example.application_tracker.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Data
@NoArgsConstructor
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
