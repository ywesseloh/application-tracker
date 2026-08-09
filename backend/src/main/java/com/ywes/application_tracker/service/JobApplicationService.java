package com.ywes.application_tracker.service;

import com.ywes.application_tracker.common.ResourceNotFoundException;
import com.ywes.application_tracker.dto.JobApplicationItem;
import com.ywes.application_tracker.dto.JobApplicationMutation;
import com.ywes.application_tracker.model.BoardPlacement;
import com.ywes.application_tracker.model.JobApplication;
import com.ywes.application_tracker.model.JobApplicationStatus;
import com.ywes.application_tracker.model.User;
import com.ywes.application_tracker.repository.JobApplicationRepository;
import com.ywes.application_tracker.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobApplicationService {
    @Autowired private BoardService boardService;
    @Autowired private UserService userService;
    @Autowired private JobApplicationRepository repo;

    public List<JobApplicationItem> getJobApplications(Integer userId) {
        return repo.findAllItemsByUserId(userId);
    }

    public JobApplicationItem getJobApplicationById(int id, Integer userId) {
        JobApplication entity = requireOwnedApplication(id, userId);
        return JobApplicationItem.from(entity);
    }

    @Transactional
    public void addJobApplication(JobApplicationMutation jobApplication, Integer userId) {
        JobApplication entity = JobApplication.fromJobApplicationMutation(jobApplication, null);
        repo.saveAndFlush(entity);

        User user = userService.getUserById(userId);
        int position = boardService.getStatusCount(entity.getStatus(), userId);
        BoardPlacement placement = new BoardPlacement(
                entity,
                entity.getStatus(),
                position,
                user.getId()
        );

        entity.setUser(user);
        entity.setPlacement(placement);
        repo.save(entity);
    }

    @Transactional
    public void updateJobApplication(int id, JobApplicationMutation application, Integer userId) {
        JobApplication current = requireOwnedApplication(id, userId);

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
    public void deleteJobApplication(int id, Integer userId) {
        JobApplication application = requireOwnedApplication(id, userId);

        BoardPlacement placement = application.getPlacement();
        if (placement != null) {
            boardService.compactColumnOnRemove(
                    placement.getApplicationId(),
                    placement.getStatus(),
                    placement.getPosition(),
                    userId
            );
        }

        repo.delete(application);
    }

    @Transactional
    public void patchStatus(int applicationId, JobApplicationStatus status, Integer userId) {
        repo.patchStatus(applicationId, userId, status);
    }

    private JobApplication requireOwnedApplication(int id, Integer userId) {
        return repo.findByIdAndUserId(id, userId).orElseThrow(() ->
                new ResourceNotFoundException("Job application with id " + id + " not found")
        );
    }
}
