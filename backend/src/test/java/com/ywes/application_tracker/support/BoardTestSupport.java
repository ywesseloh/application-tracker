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
import com.ywes.application_tracker.security.AuthUser;
import com.ywes.application_tracker.service.JobApplicationService;
import jakarta.persistence.EntityManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.util.Arrays;
import java.util.List;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;

public final class BoardTestSupport {
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

    public static AuthUser authUser(User user) {
        return new AuthUser(user.getId(), user.getUsername());
    }

    public static RequestPostProcessor asUser(User user) {
        return authentication(new UsernamePasswordAuthenticationToken(
                authUser(user),
                null,
                AuthorityUtils.NO_AUTHORITIES
        ));
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
