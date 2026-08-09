package com.ywes.application_tracker.service;

import com.ywes.application_tracker.common.ResourceNotFoundException;
import com.ywes.application_tracker.dto.JobApplicationMutation;
import com.ywes.application_tracker.model.JobApplication;
import com.ywes.application_tracker.model.User;
import com.ywes.application_tracker.repository.BoardPlacementRepository;
import com.ywes.application_tracker.repository.JobApplicationRepository;
import com.ywes.application_tracker.repository.UserRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.ywes.application_tracker.model.JobApplicationStatus.*;
import static com.ywes.application_tracker.support.BoardTestSupport.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@Transactional
class JobApplicationServiceTest {
    @Autowired private JobApplicationService jobApplicationService;
    @Autowired private BoardService boardService;
    @Autowired private JobApplicationRepository jobApplicationRepository;
    @Autowired private BoardPlacementRepository placementRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private EntityManager entityManager;

    private User user;
    private Integer userId;

    @BeforeEach
    void setUp() {
        user = persistUser(userRepository, "app-tester");
        userId = user.getId();
    }

    @Test
    void createInsertsNewEntity() {
        jobApplicationService.addJobApplication(
                new JobApplicationMutation("First", "Role", WISHLIST, "Some notes", "MyUrl"),
                userId
        );
        int id = findApplicationId(jobApplicationRepository, "First");
        JobApplication jobApplication = applicationFor(jobApplicationRepository, id);

        assertEquals(1, jobApplicationRepository.findAll().size());
        assertEquals("First", jobApplication.getCompany());
        assertEquals("Role", jobApplication.getRole());
        assertEquals(WISHLIST, jobApplication.getStatus());
        assertEquals("Some notes", jobApplication.getNotes());
        assertEquals("MyUrl", jobApplication.getJobPostingUrl());
        assertEquals(userId, jobApplication.getUser().getId());
    }

    @Test
    void createAppendsToEndOfStatusColumn() {
        jobApplicationService.addJobApplication(mutation("First", "Role", WISHLIST), userId);
        jobApplicationService.addJobApplication(mutation("Second", "Role", WISHLIST), userId);

        assertEquals(2, boardService.getBoard(userId).size());
        int secondId = findApplicationId(jobApplicationRepository, "Second");
        assertEquals(1, placementFor(placementRepository, secondId).getPosition());
        assertEquals(List.of(0, 1), positionsIn(placementRepository, user, WISHLIST));
    }

    @Test
    void updateMutatesEntity() {
        seed(
                jobApplicationService,
                userId,
                new JobApplicationMutation("First", "Role", WISHLIST, "Some notes", "MyUrl")
        );
        int id = findApplicationId(jobApplicationRepository, "First");
        jobApplicationService.updateJobApplication(id, new JobApplicationMutation(
                "Second",
                "OtherRole",
                INTERVIEW,
                "Other Notes",
                "Other Url"
        ), userId);
        JobApplication jobApplication = applicationFor(jobApplicationRepository, id);

        assertEquals(1, jobApplicationRepository.findAll().size());
        assertEquals("Second", jobApplication.getCompany());
        assertEquals("OtherRole", jobApplication.getRole());
        assertEquals(INTERVIEW, jobApplication.getStatus());
        assertEquals("Other Notes", jobApplication.getNotes());
        assertEquals("Other Url", jobApplication.getJobPostingUrl());
    }

    @Test
    void updateStatusMovesToEndOfNewColumn() {
        seed(
                jobApplicationService,
                userId,
                mutation("Existing", "Role", APPLIED),
                mutation("Moving", "Role", WISHLIST)
        );

        int movingId = findApplicationId(jobApplicationRepository, "Moving");
        jobApplicationService.updateJobApplication(
                movingId,
                mutation("Moving", "Role", APPLIED),
                userId
        );
        refreshPersistence(entityManager);

        var moved = placementFor(placementRepository, movingId);
        assertEquals(APPLIED, moved.getStatus());
        assertEquals(1, moved.getPosition());
        assertEquals(List.of(0, 1), positionsIn(placementRepository, user, APPLIED));
    }

    @Test
    void deleteRemovesApplicationAndDensifiesColumn() {
        seed(
                jobApplicationService,
                userId,
                mutation("A", "Role", WISHLIST),
                mutation("B", "Role", WISHLIST),
                mutation("C", "Role", WISHLIST)
        );

        int bId = findApplicationId(jobApplicationRepository, "B");
        jobApplicationService.deleteJobApplication(bId, userId);
        refreshPersistence(entityManager);

        assertEquals(2, jobApplicationRepository.count());
        assertEquals(2, placementRepository.count());
        assertEquals(List.of(0, 1), positionsIn(placementRepository, user, WISHLIST));
        assertThrows(ResourceNotFoundException.class, () ->
                jobApplicationService.getJobApplicationById(bId, userId)
        );
    }
}
