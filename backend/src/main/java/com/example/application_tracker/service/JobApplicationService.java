package com.example.application_tracker.service;

import com.example.application_tracker.model.JobApplication;
import com.example.application_tracker.dto.JobApplicationPatch;
import com.example.application_tracker.repository.JobApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class JobApplicationService {
    @Autowired
    JobApplicationRepository repo;
    public List<JobApplication> getJobApplications() {
        return repo.findAll();
    }

    public Optional<JobApplication> getJobApplicationById(int id) {
        return repo.findById(id);
    }

    public void addJobApplication(JobApplication jobApplication) {
        repo.save(jobApplication);
    }

    public void updateJobApplication(int id, JobApplication jobApplication) {
        repo.save(jobApplication);
    }

    public void patchJobApplication(int id, JobApplicationPatch patch) {
        repo.patch(id, patch.getStatus(),  patch.getColumnPosition());
    }

    public void deleteJobApplication(int id) {
        repo.deleteById(id);
    }
}
