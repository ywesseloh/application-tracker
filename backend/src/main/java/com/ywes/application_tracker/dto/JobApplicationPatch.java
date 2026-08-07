package com.ywes.application_tracker.dto;

import com.ywes.application_tracker.model.JobApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JobApplicationPatch {
    private JobApplicationStatus status;
    private Integer columnPosition;
}
