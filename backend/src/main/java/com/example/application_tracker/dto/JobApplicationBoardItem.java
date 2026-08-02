package com.example.application_tracker.dto;

import com.example.application_tracker.model.BoardPlacement;
import com.example.application_tracker.model.JobApplication;
import com.example.application_tracker.model.JobApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JobApplicationBoardItem {
    private Integer id;
    private String company;
    private String role;
    private JobApplicationStatus status;
    private Integer columnPosition;
    private String notes;
    private String jobPostingUrl;

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
