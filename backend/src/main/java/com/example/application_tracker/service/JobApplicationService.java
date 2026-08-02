package com.example.application_tracker.service;

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

    public Optional<JobApplicationItem> getJobApplicationById(int id) {
        return repo.findById(id).map(JobApplicationItem::from);
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
    public boolean updateJobApplication(int id, JobApplicationMutation application) {
        JobApplication current = repo.findById(id).orElse(null);
        if (current == null) {
            return false;
        }

        BoardPlacement placement = current.getPlacement();
        if (placement != null && current.getStatus() != application.getStatus()) {
            boardService.moveToStatus(
                    placement,
                    application.getStatus()
            );
        }

        current.setCompany(application.getCompany());
        current.setRole(application.getRole());
        current.setStatus(application.getStatus());
        current.setNotes(application.getNotes());
        current.setJobPostingUrl(application.getJobPostingUrl());
        repo.save(current);
        return true;
    }

    @Transactional
    public boolean deleteJobApplication(int id) {
        JobApplication application = repo.findById(id).orElse(null);
        if (application == null) {
            return false;
        }

        BoardPlacement placement = application.getPlacement();
        JobApplicationStatus status = null;
        Integer position = null;
        if (placement != null) {
            status = placement.getStatus();
            position = placement.getPosition();
        }

        repo.delete(application);

        if (status != null && position != null) {
            boardService.densifyColumn(status, position);
        }
        return true;
    }

    @Transactional
    public void patchStatus(int applicationId, JobApplicationStatus status) {
        repo.patchStatus(applicationId, status);
    }
}
