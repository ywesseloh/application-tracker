package com.example.application_tracker.support;

import com.example.application_tracker.dto.JobApplicationBoardItem;
import com.example.application_tracker.dto.JobApplicationMutation;
import com.example.application_tracker.dto.JobApplicationPatch;
import com.example.application_tracker.model.BoardPlacement;
import com.example.application_tracker.model.JobApplication;
import com.example.application_tracker.model.JobApplicationStatus;
import com.example.application_tracker.repository.BoardPlacementRepository;
import com.example.application_tracker.repository.JobApplicationRepository;
import com.example.application_tracker.service.BoardService;
import com.example.application_tracker.service.JobApplicationService;
import jakarta.persistence.EntityManager;

import java.util.Arrays;
import java.util.List;

public final class BoardTestSupport {
    private BoardTestSupport() {}

    public static JobApplicationMutation mutation(
            String company,
            String role,
            JobApplicationStatus status
    ) {
        return new JobApplicationMutation(company, role, status, null, null);
    }

    public static void seed(JobApplicationService service, JobApplicationMutation... mutations) {
        Arrays.stream(mutations).forEach(service::addJobApplication);
    }

    public static JobApplicationPatch patch(JobApplicationStatus status, Integer columnPosition) {
        return new JobApplicationPatch(status, columnPosition);
    }

    public static List<String> companiesIn(
            BoardPlacementRepository repository,
            JobApplicationStatus status
    ) {
        return placementsIn(repository, status).stream()
                .map(placement -> placement.getApplication().getCompany())
                .toList();
    }

    public static List<String> companiesIn(
            JobApplicationRepository repository,
            JobApplicationStatus status
    ) {
        return applicationsIn(repository, status).stream()
                .map(JobApplication::getCompany)
                .toList();
    }

    public static int findApplicationId(JobApplicationRepository repository, String companyName) {
        return repository.findAll().stream()
                .filter(application -> companyName.equals(application.getCompany()))
                .findFirst()
                .orElseThrow()
                .getId();
    }

    public static List<Integer> positionsIn(
            BoardPlacementRepository repository,
            JobApplicationStatus status
    ) {
        return placementsIn(repository, status).stream()
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
            JobApplicationStatus status
    ) {
        return repository.findAllWithApplicationOrdered().stream()
                .filter(placement -> placement.getStatus() == status)
                .toList();
    }

    public static List<JobApplication> applicationsIn(
            JobApplicationRepository repository,
            JobApplicationStatus status
    ) {
        return repository.findAll().stream()
                .filter(jobApplication -> jobApplication.getStatus() == status)
                .toList();
    }
}
