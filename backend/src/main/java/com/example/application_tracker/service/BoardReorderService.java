package com.example.application_tracker.service;

import com.example.application_tracker.dto.JobApplicationPatch;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BoardReorderService {
    @Autowired private BoardService boardService;
    @Autowired private JobApplicationService jobApplicationService;

    public boolean moveJobApplication(int id, JobApplicationPatch patch) {
        if (!boardService.moveJobApplication(id, patch)) { return false; }
        jobApplicationService.patchStatus(id, patch.getStatus());
        return true;
    }
}
