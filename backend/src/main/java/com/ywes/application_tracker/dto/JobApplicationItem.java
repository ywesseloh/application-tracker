package com.ywes.application_tracker.dto;

import com.ywes.application_tracker.model.JobApplication;
import com.ywes.application_tracker.model.JobApplicationStatus;

public record JobApplicationItem(
        Integer id,
        String company,
        String role,
        JobApplicationStatus status,
        String notes,
        String jobPostingUrl
) {
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
