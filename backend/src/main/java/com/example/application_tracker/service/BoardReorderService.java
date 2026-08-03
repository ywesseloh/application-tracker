package com.example.application_tracker.service;

import com.example.application_tracker.common.ResourceNotFoundException;
import com.example.application_tracker.dto.JobApplicationPatch;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BoardReorderService {
    @Autowired private BoardService boardService;
    @Autowired private JobApplicationService jobApplicationService;

    @Transactional
    public void moveJobApplication(int id, JobApplicationPatch patch) {
        boardService.moveJobApplication(id, patch);
        jobApplicationService.patchStatus(id, patch.getStatus());
    }
}
