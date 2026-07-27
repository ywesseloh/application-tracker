package com.example.application_tracker;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JobApplicationPatch {
    private String status;
    private Integer columnPosition;
}
