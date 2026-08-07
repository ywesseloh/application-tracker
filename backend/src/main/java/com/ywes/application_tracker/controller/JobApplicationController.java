package com.ywes.application_tracker.controller;

import com.ywes.application_tracker.dto.JobApplicationItem;
import com.ywes.application_tracker.dto.JobApplicationMutation;
import com.ywes.application_tracker.service.JobApplicationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api")
public class JobApplicationController {
    @Autowired
    JobApplicationService service;

    @GetMapping("/applications")
    public List<JobApplicationItem> getJobApplications() {
        return service.getJobApplications();
    }

    @GetMapping("/applications/{id}")
    public JobApplicationItem getJobApplicationById(@PathVariable int id) {
        return service.getJobApplicationById(id);
    }

    @PostMapping("/applications")
    public void addJobApplication(@Valid @RequestBody JobApplicationMutation application) {
        service.addJobApplication(application);
    }

    @PutMapping("/applications/{id}")
    public void updateJobApplication(
            @PathVariable int id,
            @Valid @RequestBody JobApplicationMutation application
    ) {
        service.updateJobApplication(id, application);
    }

    @DeleteMapping("/applications/{id}")
    public void deleteJobApplication(@PathVariable int id) {
        service.deleteJobApplication(id);
    }
}
