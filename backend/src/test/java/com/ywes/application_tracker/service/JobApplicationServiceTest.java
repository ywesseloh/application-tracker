package com.ywes.application_tracker.service;

import com.ywes.application_tracker.common.ResourceNotFoundException;
import com.ywes.application_tracker.dto.JobApplicationMutation;
import com.ywes.application_tracker.model.JobApplication;
import com.ywes.application_tracker.repository.BoardPlacementRepository;
import com.ywes.application_tracker.repository.JobApplicationRepository;
import jakarta.persistence.EntityManager;
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
    @Autowired private EntityManager entityManager;

    @Test
    void createInsertsNewEntity() {
        jobApplicationService.addJobApplication(new JobApplicationMutation("First", "Role", WISHLIST, "Some notes", "MyUrl"));
        int id = findApplicationId(jobApplicationRepository, "First");
        JobApplication jobApplication = applicationFor(jobApplicationRepository, id);

        assertEquals(1, jobApplicationRepository.findAll().size());
        assertEquals("First", jobApplication.getCompany());
        assertEquals("Role", jobApplication.getRole());
        assertEquals(WISHLIST, jobApplication.getStatus());
        assertEquals("Some notes", jobApplication.getNotes());
        assertEquals("MyUrl", jobApplication.getJobPostingUrl());
    }

    @Test
    void createAppendsToEndOfStatusColumn() {
        jobApplicationService.addJobApplication(mutation("First", "Role", WISHLIST));
        jobApplicationService.addJobApplication(mutation("Second", "Role", WISHLIST));

        assertEquals(2, boardService.getBoard().size());
        int secondId = findApplicationId(jobApplicationRepository, "Second");
        assertEquals(1, placementFor(placementRepository, secondId).getPosition());
        assertEquals(List.of(0, 1), positionsIn(placementRepository, WISHLIST));
    }

    @Test
    void updateMutatesEntity() {
        seed(
                jobApplicationService,
                new JobApplicationMutation("First", "Role", WISHLIST, "Some notes", "MyUrl")
        );
        int id = findApplicationId(jobApplicationRepository, "First");
        jobApplicationService.updateJobApplication(id, new JobApplicationMutation(
                "Second",
                "OtherRole",
                INTERVIEW,
                "Other Notes",
                "Other Url"
        ));
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
                mutation("Existing", "Role", APPLIED),
                mutation("Moving", "Role", WISHLIST)
        );

        int movingId = findApplicationId(jobApplicationRepository, "Moving");
        jobApplicationService.updateJobApplication(
                movingId,
                mutation("Moving", "Role", APPLIED)
        );
        refreshPersistence(entityManager);

        var moved = placementFor(placementRepository, movingId);
        assertEquals(APPLIED, moved.getStatus());
        assertEquals(1, moved.getPosition());
        assertEquals(List.of(0, 1), positionsIn(placementRepository, APPLIED));
    }

    @Test
    void deleteRemovesApplicationAndDensifiesColumn() {
        seed(
                jobApplicationService,
                mutation("A", "Role", WISHLIST),
                mutation("B", "Role", WISHLIST),
                mutation("C", "Role", WISHLIST)
        );

        int bId = findApplicationId(jobApplicationRepository, "B");
        jobApplicationService.deleteJobApplication(bId);
        refreshPersistence(entityManager);

        assertEquals(2, jobApplicationRepository.count());
        assertEquals(2, placementRepository.count());
        assertEquals(List.of(0, 1), positionsIn(placementRepository, WISHLIST));
        assertThrows(ResourceNotFoundException.class, () ->
                jobApplicationService.getJobApplicationById(bId)
        );
    }
}
