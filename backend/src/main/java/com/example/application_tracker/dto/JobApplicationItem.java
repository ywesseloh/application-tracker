package com.example.application_tracker.dto;

import com.example.application_tracker.model.JobApplication;
import com.example.application_tracker.model.JobApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JobApplicationItem {
    private Integer id;
    private String company;
    private String role;
    private JobApplicationStatus status;
    private String notes;
    private String jobPostingUrl;

    public static JobApplicationItem from(JobApplication application) {
        return new JobApplicationItem(
                application.getId(),
                application.getCompany(),
                application.getRole(),
                application.getStatus(),
                application.getNotes(),
                application.getJobPostingUrl()
        );
    }
}
