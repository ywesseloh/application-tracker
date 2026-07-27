package com.example.application_tracker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class JobApplicationController {
    @Autowired JobApplicationService service;

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
    public void addJobApplication(@RequestBody JobApplication application) {
        service.addJobApplication(application);
    }

    @PutMapping("/application/{id}")
    public void updateJobApplication(@PathVariable int id, @RequestBody JobApplication application) {
        service.updateJobApplication(id, application);
    }

    @PatchMapping("application/{id}")
    public void patchJobApplication(@PathVariable int id, @RequestBody JobApplicationPatch patch) {
        service.patchJobApplication(id, patch);
    }

    @DeleteMapping("application/{id}")
    public void deleteJobApplication(@PathVariable int id) {
        service.deleteJobApplication(id);
    }
}
