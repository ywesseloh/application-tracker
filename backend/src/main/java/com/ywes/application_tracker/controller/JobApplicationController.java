package com.ywes.application_tracker.controller;

import com.ywes.application_tracker.dto.JobApplicationItem;
import com.ywes.application_tracker.dto.JobApplicationMutation;
import com.ywes.application_tracker.security.CurrentUserId;
import com.ywes.application_tracker.service.JobApplicationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class JobApplicationController {
    @Autowired
    JobApplicationService service;

    @GetMapping("/applications")
    public List<JobApplicationItem> getJobApplications(@CurrentUserId Integer userId) {
        return service.getJobApplications(userId);
    }

    @GetMapping("/applications/{id}")
    public JobApplicationItem getJobApplicationById(
            @CurrentUserId Integer userId,
            @PathVariable int id
    ) {
        return service.getJobApplicationById(id, userId);
    }

    @PostMapping("/applications")
    public void addJobApplication(
            @CurrentUserId Integer userId,
            @Valid @RequestBody JobApplicationMutation application
    ) {
        service.addJobApplication(application, userId);
    }

    @PutMapping("/applications/{id}")
    public void updateJobApplication(
            @CurrentUserId Integer userId,
            @PathVariable int id,
            @Valid @RequestBody JobApplicationMutation application
    ) {
        service.updateJobApplication(id, application, userId);
    }

    @DeleteMapping("/applications/{id}")
    public void deleteJobApplication(
            @CurrentUserId Integer userId,
            @PathVariable int id
    ) {
        service.deleteJobApplication(id, userId);
    }
}
