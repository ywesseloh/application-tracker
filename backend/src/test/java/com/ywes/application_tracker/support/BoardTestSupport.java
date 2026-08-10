package com.ywes.application_tracker.support;

import com.ywes.application_tracker.dto.JobApplicationMutation;
import com.ywes.application_tracker.dto.JobApplicationPatch;
import com.ywes.application_tracker.model.BoardPlacement;
import com.ywes.application_tracker.model.JobApplication;
import com.ywes.application_tracker.model.JobApplicationStatus;
import com.ywes.application_tracker.model.User;
import com.ywes.application_tracker.repository.BoardPlacementRepository;
import com.ywes.application_tracker.repository.JobApplicationRepository;
import com.ywes.application_tracker.repository.UserRepository;
import com.ywes.application_tracker.service.JobApplicationService;
import jakarta.persistence.EntityManager;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Arrays;
import java.util.List;

public final class BoardTestSupport {
    /** Matches {@code @WithMockUser(username = "1")} on controller tests. */
    public static final int MOCK_USER_ID = 1;

    private BoardTestSupport() {}

    public static User persistUser(UserRepository userRepository, String username) {
        return userRepository.findByUsername(username).orElseGet(() ->
                userRepository.saveAndFlush(new User(
                        null,
                        username,
                        new BCryptPasswordEncoder().encode("password"),
                        null,
                        null
                ))
        );
    }

    public static User ensureMockUser(UserRepository userRepository, JdbcTemplate jdbcTemplate) {
        return userRepository.findById(MOCK_USER_ID).orElseGet(() -> {
            jdbcTemplate.update(
                    """
                    INSERT INTO users (id, username, password, created_at, updated_at)
                    VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    """,
                    MOCK_USER_ID,
                    "mock-user",
                    new BCryptPasswordEncoder().encode("password")
            );
            jdbcTemplate.execute(
                    "ALTER TABLE users ALTER COLUMN id RESTART WITH " + (MOCK_USER_ID + 1)
            );
            return userRepository.findById(MOCK_USER_ID).orElseThrow();
        });
    }

    public static JobApplicationMutation mutation(
            String company,
            String role,
            JobApplicationStatus status
    ) {
        return new JobApplicationMutation(company, role, status, null, null);
    }

    public static void seed(
            JobApplicationService service,
            Integer userId,
            JobApplicationMutation... mutations
    ) {
        Arrays.stream(mutations).forEach(mutation -> service.addJobApplication(mutation, userId));
    }

    public static void seed(
            JobApplicationService service,
            User user,
            JobApplicationMutation... mutations
    ) {
        seed(service, user.getId(), mutations);
    }

    public static JobApplicationPatch patch(JobApplicationStatus status, Integer columnPosition) {
        return new JobApplicationPatch(status, columnPosition);
    }

    public static List<String> companiesIn(
            BoardPlacementRepository repository,
            User user,
            JobApplicationStatus status
    ) {
        return placementsIn(repository, user, status).stream()
                .map(placement -> placement.getApplication().getCompany())
                .toList();
    }

    public static List<String> companiesIn(
            JobApplicationRepository repository,
            User user,
            JobApplicationStatus status
    ) {
        return applicationsIn(repository, user, status).stream()
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
            User user,
            JobApplicationStatus status
    ) {
        return placementsIn(repository, user, status).stream()
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
            User user,
            JobApplicationStatus status
    ) {
        return repository.findAllWithApplicationOrdered(user.getId()).stream()
                .filter(placement -> placement.getStatus() == status)
                .toList();
    }

    public static List<JobApplication> applicationsIn(
            JobApplicationRepository repository,
            User user,
            JobApplicationStatus status
    ) {
        return repository.findAll().stream()
                .filter(jobApplication -> jobApplication.getUser().getId().equals(user.getId()))
                .filter(jobApplication -> jobApplication.getStatus() == status)
                .toList();
    }
}
