package com.example.application_tracker;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
    @NotBlank(message="Status is mandatory")
    private String status;
    @NotNull(message="Column position is mandatory")
    private Integer columnPosition;
    private String notes;
    private String jobPostingUrl;
}
