package com.ywes.application_tracker.controller;

import com.ywes.application_tracker.dto.JobApplicationItem;
import com.ywes.application_tracker.dto.JobApplicationMutation;
import com.ywes.application_tracker.service.JobApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
public class JobApplicationController {
    @Autowired
    JobApplicationService service;

    @GetMapping("/applications")
    public List<JobApplicationItem> getJobApplications() {
        return service.getJobApplications();
    }

    @GetMapping("/application/{id}")
    public JobApplicationItem getJobApplicationById(@PathVariable int id) {
        return service.getJobApplicationById(id);
    }

    @PostMapping("/application")
    public void addJobApplication(@RequestBody JobApplicationMutation application) {
        service.addJobApplication(application);
    }

    @PutMapping("/application/{id}")
    public void updateJobApplication(
            @PathVariable int id,
            @RequestBody JobApplicationMutation application
    ) {
        service.updateJobApplication(id, application);
    }

    @DeleteMapping("/application/{id}")
    public void deleteJobApplication(@PathVariable int id) {
        service.deleteJobApplication(id);
    }
}
