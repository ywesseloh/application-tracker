package com.example.application_tracker.service;

import com.example.application_tracker.common.ResourceNotFoundException;
import com.example.application_tracker.dto.JobApplicationItem;
import com.example.application_tracker.dto.JobApplicationMutation;
import com.example.application_tracker.model.BoardPlacement;
import com.example.application_tracker.model.JobApplication;
import com.example.application_tracker.model.JobApplicationStatus;
import com.example.application_tracker.repository.JobApplicationRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class JobApplicationService {
    @Autowired private BoardService boardService;
    @Autowired private JobApplicationRepository repo;

    public List<JobApplicationItem> getJobApplications() {
        return repo.findAllItems();
    }

    public JobApplicationItem getJobApplicationById(int id) {
        JobApplication entity = repo.findById(id).orElseThrow(() ->
            new ResourceNotFoundException("Job application with id " + id + " not found")
        );
        return JobApplicationItem.from(entity);
    }

    @Transactional
    public void addJobApplication(JobApplicationMutation jobApplication) {
        JobApplication entity = JobApplication.fromJobApplicationMutation(jobApplication, null);
        repo.saveAndFlush(entity);

        int position = boardService.getStatusCount(entity.getStatus());
        BoardPlacement placement = new BoardPlacement(
                entity,
                entity.getStatus(),
                position
        );
        entity.setPlacement(placement);
        repo.save(entity);
    }

    @Transactional
    public void updateJobApplication(int id, JobApplicationMutation application) {
        JobApplication current = repo.findById(id).orElseThrow(() ->
            new ResourceNotFoundException("Job application with id " + id + " not found")
        );

        BoardPlacement placement = current.getPlacement();
        if (placement != null && current.getStatus() != application.getStatus()) {
            boardService.move(
                    placement,
                    application.getStatus(),
                    null
            );
        }

        current.setCompany(application.getCompany());
        current.setRole(application.getRole());
        current.setStatus(application.getStatus());
        current.setNotes(application.getNotes());
        current.setJobPostingUrl(application.getJobPostingUrl());
        repo.save(current);
    }

    @Transactional
    public void deleteJobApplication(int id) {
        JobApplication application = repo.findById(id).orElseThrow(() ->
            new ResourceNotFoundException("Job application with id " + id + " not found")
        );

        BoardPlacement placement = application.getPlacement();
        if (placement != null) {
            boardService.compactColumnOnRemove(
                    placement.getApplicationId(),
                    placement.getStatus(),
                    placement.getPosition()
            );
        }

        repo.delete(application);
    }

    @Transactional
    public void patchStatus(int applicationId, JobApplicationStatus status) {
        repo.patchStatus(applicationId, status);
    }
}
