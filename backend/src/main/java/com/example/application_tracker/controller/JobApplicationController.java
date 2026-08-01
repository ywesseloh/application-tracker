package com.example.application_tracker.controller;

import com.example.application_tracker.dto.JobApplicationDTO;
import com.example.application_tracker.model.JobApplication;
import com.example.application_tracker.dto.JobApplicationPatch;
import com.example.application_tracker.service.JobApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
public class JobApplicationController {
    @Autowired
    JobApplicationService service;

    @GetMapping("/applications")
    public List<JobApplication> getJobApplications() {
        return service.getJobApplications();
    }

    @GetMapping("/application/{id}")
    public ResponseEntity<JobApplication> getJobApplicationById(@PathVariable int id) {
        return service.getJobApplicationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/application")
    public void addJobApplication(@RequestBody JobApplicationDTO application) {
        service.addJobApplication(application);
    }

    @PutMapping("/application/{id}")
    public ResponseEntity<Void> updateJobApplication(@PathVariable int id, @RequestBody JobApplicationDTO application) {
        return service.updateJobApplication(id, application)
                ? ResponseEntity.ok().build()
                : ResponseEntity.notFound().build();
    }

    @PatchMapping("/applications")
    public void patchJobApplications(@RequestBody List<JobApplicationPatch> patches) {
        service.patchJobApplications(patches);
    }

    @DeleteMapping("/application/{id}")
    public ResponseEntity<Void> deleteJobApplication(@PathVariable int id) {
        return service.deleteJobApplication(id)
                ? ResponseEntity.ok().build()
                : ResponseEntity.notFound().build();
    }
}
