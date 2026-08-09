package com.ywes.application_tracker.dto;

import com.ywes.application_tracker.model.BoardPlacement;
import com.ywes.application_tracker.model.JobApplication;
import com.ywes.application_tracker.model.JobApplicationStatus;

public record JobApplicationBoardItem(
        Integer id,
        String company,
        String role,
        JobApplicationStatus status,
        Integer columnPosition,
        String notes,
        String jobPostingUrl
) {
    public static JobApplicationBoardItem from(BoardPlacement placement) {
        JobApplication application = placement.getApplication();
        return new JobApplicationBoardItem(
                application.getId(),
                application.getCompany(),
                application.getRole(),
                application.getStatus(),
                placement.getPosition(),
                application.getNotes(),
                application.getJobPostingUrl()
        );
    }

    public static JobApplicationBoardItem from(JobApplication application) {
        BoardPlacement placement = application.getPlacement();
        return new JobApplicationBoardItem(
                application.getId(),
                application.getCompany(),
                application.getRole(),
                application.getStatus(),
                placement != null ? placement.getPosition() : null,
                application.getNotes(),
                application.getJobPostingUrl()
        );
    }
}
