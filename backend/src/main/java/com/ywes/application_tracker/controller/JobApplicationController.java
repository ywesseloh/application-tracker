package com.ywes.application_tracker.controller;

import com.ywes.application_tracker.dto.JobApplicationItem;
import com.ywes.application_tracker.dto.JobApplicationMutation;
import com.ywes.application_tracker.security.AuthUser;
import com.ywes.application_tracker.service.JobApplicationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api")
public class JobApplicationController {
    @Autowired
    JobApplicationService service;

    @GetMapping("/applications")
    public List<JobApplicationItem> getJobApplications(@AuthenticationPrincipal AuthUser authUser) {
        return service.getJobApplications(authUser.id());
    }

    @GetMapping("/applications/{id}")
    public JobApplicationItem getJobApplicationById(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable int id
    ) {
        return service.getJobApplicationById(id, authUser.id());
    }

    @PostMapping("/applications")
    public void addJobApplication(
            @AuthenticationPrincipal AuthUser authUser,
            @Valid @RequestBody JobApplicationMutation application
    ) {
        service.addJobApplication(application, authUser.id());
    }

    @PutMapping("/applications/{id}")
    public void updateJobApplication(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable int id,
            @Valid @RequestBody JobApplicationMutation application
    ) {
        service.updateJobApplication(id, application, authUser.id());
    }

    @DeleteMapping("/applications/{id}")
    public void deleteJobApplication(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable int id
    ) {
        service.deleteJobApplication(id, authUser.id());
    }
}
