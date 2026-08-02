package com.example.application_tracker.service;

import com.example.application_tracker.dto.JobApplicationPatch;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BoardReorderService {
    @Autowired private BoardService boardService;
    @Autowired private JobApplicationService jobApplicationService;

    @Transactional
    public void patchJobApplications(List<JobApplicationPatch> patches) {
        for (JobApplicationPatch patch : patches) {
            jobApplicationService.patchStatus(patch.getId(), patch.getStatus());
            boardService.patch(patch);
        }
    }
}
