package com.example.application_tracker.service;

import com.example.application_tracker.dto.JobApplicationDTO;
import com.example.application_tracker.model.JobApplication;
import com.example.application_tracker.dto.JobApplicationPatch;
import com.example.application_tracker.repository.JobApplicationRepository;
import jakarta.transaction.Transactional;
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

    public void addJobApplication(JobApplicationDTO jobApplication) {
        int columnCount = repo.countByStatus(jobApplication.getStatus());
        JobApplication jobApplicationEntity = JobApplication.fromJobApplicationDTO(
            jobApplication,
            null,
            columnCount
        );
        repo.save(jobApplicationEntity);
    }

    public boolean updateJobApplication(int id, JobApplicationDTO application) {
        JobApplication currentApplication = repo.findById(id).orElse(null);
        if (currentApplication == null) { return false; }

        int columnCount;
        if (currentApplication.getStatus() != application.getStatus()) {
            // Application moved to different board column, update positions
            repo.updateColumnPositionsOnRemove(currentApplication.getStatus(), currentApplication.getColumnPosition());
            columnCount = repo.countByStatus(application.getStatus());
        } else {
            columnCount = currentApplication.getColumnPosition();
        }

        JobApplication jobApplicationEntity = JobApplication.fromJobApplicationDTO(
            application,
            id,
            columnCount
        );
        repo.save(jobApplicationEntity);
        return true;
    }

    @Transactional public void patchJobApplications(List<JobApplicationPatch> patches) {
        for (JobApplicationPatch patch : patches) {
            repo.patch(patch.getId(), patch.getStatus(),  patch.getColumnPosition());
        }
    }

    public boolean deleteJobApplication(int id) {
        JobApplication jobApplication = repo.findById(id).orElse(null);
        if (jobApplication == null) { return false; }

        repo.deleteById(id);
        repo.updateColumnPositionsOnRemove(jobApplication.getStatus(), jobApplication.getColumnPosition());
        return true;
    }
}
