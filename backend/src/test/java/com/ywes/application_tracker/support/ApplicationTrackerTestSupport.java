package com.ywes.application_tracker.support;

import com.ywes.application_tracker.dto.JobApplicationMutation;
import com.ywes.application_tracker.dto.JobApplicationPatch;
import com.ywes.application_tracker.model.BoardPlacement;
import com.ywes.application_tracker.model.JobApplication;
import com.ywes.application_tracker.model.JobApplicationStatus;
import com.ywes.application_tracker.repository.BoardPlacementRepository;
import com.ywes.application_tracker.repository.JobApplicationRepository;
import jakarta.persistence.EntityManager;

import java.util.List;

public final class ApplicationTrackerTestSupport {
    /** Entity identifiers */
    public static final int USER_ID = 1;

    public static final int APP_ALPHA = 1;
    public static final int APP_BETA = 2;
    public static final int APP_A = 1;
    public static final int APP_B = 2;
    public static final int APP_C = 3;
    public static final int APP_WISH = 1;
    public static final int APP_APPLIED_A = 2;
    public static final int APP_APPLIED_B = 3;
    public static final int APP_ONLY = 1;
    public static final int APP_FIRST = 1;
    public static final int APP_EXISTING = 1;
    public static final int APP_MOVING = 2;

    private ApplicationTrackerTestSupport() {}

    public static JobApplicationMutation mutation(
            String company,
            String role,
            JobApplicationStatus status
    ) {
        return new JobApplicationMutation(company, role, status, null, null);
    }

    public static JobApplicationPatch patch(JobApplicationStatus status, Integer columnPosition) {
        return new JobApplicationPatch(status, columnPosition);
    }

    public static List<String> companiesIn(
            BoardPlacementRepository repository,
            Integer userId,
            JobApplicationStatus status
    ) {
        return placementsIn(repository, userId, status).stream()
                .map(placement -> placement.getApplication().getCompany())
                .toList();
    }

    public static List<String> companiesIn(
            JobApplicationRepository repository,
            Integer userId,
            JobApplicationStatus status
    ) {
        return applicationsIn(repository, userId, status).stream()
                .map(JobApplication::getCompany)
                .toList();
    }

    public static List<Integer> positionsIn(
            BoardPlacementRepository repository,
            Integer userId,
            JobApplicationStatus status
    ) {
        return placementsIn(repository, userId, status).stream()
                .map(BoardPlacement::getPosition)
                .toList();
    }

    public static BoardPlacement placementFor(
            BoardPlacementRepository repository,
            int applicationId
    ) {
        return repository.findById(applicationId)
                .orElseThrow(() -> new AssertionError("Placement " + applicationId + " not found"));
    }

    public static JobApplication applicationFor(
            JobApplicationRepository repository,
            int applicationId
    ) {
        return repository.findById(applicationId)
                .orElseThrow(() -> new AssertionError("Job Application " + applicationId + " not found"));
    }

    public static void refreshPersistence(EntityManager entityManager) {
        entityManager.flush();
        entityManager.clear();
    }

    public static List<BoardPlacement> placementsIn(
            BoardPlacementRepository repository,
            Integer userId,
            JobApplicationStatus status
    ) {
        return repository.findAllWithApplicationOrdered(userId).stream()
                .filter(placement -> placement.getStatus() == status)
                .toList();
    }

    public static List<JobApplication> applicationsIn(
            JobApplicationRepository repository,
            Integer userId,
            JobApplicationStatus status
    ) {
        return repository.findAll().stream()
                .filter(jobApplication -> jobApplication.getUser().getId().equals(userId))
                .filter(jobApplication -> jobApplication.getStatus() == status)
                .toList();
    }
}
