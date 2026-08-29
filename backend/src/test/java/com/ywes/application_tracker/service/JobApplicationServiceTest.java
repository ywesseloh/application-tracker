package com.ywes.application_tracker.service;

import com.ywes.application_tracker.exceptions.ResourceNotFoundException;
import com.ywes.application_tracker.dto.JobApplicationMutation;
import com.ywes.application_tracker.model.JobApplication;
import com.ywes.application_tracker.repository.BoardPlacementRepository;
import com.ywes.application_tracker.repository.JobApplicationRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.ywes.application_tracker.model.JobApplicationStatus.*;
import static com.ywes.application_tracker.support.ApplicationTrackerTestSupport.*;
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
    @Sql({"/sql/cleanup.sql", "/sql/user.sql"})
    void createInsertsNewEntity() {
        jobApplicationService.addJobApplication(
                new JobApplicationMutation("First", "Role", WISHLIST, "Some notes", "MyUrl"),
                USER_ID
        );
        JobApplication jobApplication = applicationFor(jobApplicationRepository, APP_FIRST);

        assertEquals(1, jobApplicationRepository.findAll().size());
        assertEquals("First", jobApplication.getCompany());
        assertEquals("Role", jobApplication.getRole());
        assertEquals(WISHLIST, jobApplication.getStatus());
        assertEquals("Some notes", jobApplication.getNotes());
        assertEquals("MyUrl", jobApplication.getJobPostingUrl());
        assertEquals(USER_ID, jobApplication.getUser().getId());
    }

    @Test
    @Sql({"/sql/cleanup.sql", "/sql/user.sql"})
    void createAppendsToEndOfStatusColumn() {
        jobApplicationService.addJobApplication(mutation("First", "Role", WISHLIST), USER_ID);
        jobApplicationService.addJobApplication(mutation("Second", "Role", WISHLIST), USER_ID);

        assertEquals(2, boardService.getBoard(USER_ID).size());
        assertEquals(1, placementFor(placementRepository, 2).getPosition());
        assertEquals(List.of(0, 1), positionsIn(placementRepository, USER_ID, WISHLIST));
    }

    @Test
    @Sql({"/sql/cleanup.sql", "/sql/board_first.sql"})
    void updateMutatesEntity() {
        jobApplicationService.updateJobApplication(APP_FIRST, new JobApplicationMutation(
                "Second",
                "OtherRole",
                INTERVIEW,
                "Other Notes",
                "Other Url"
        ), USER_ID);
        JobApplication jobApplication = applicationFor(jobApplicationRepository, APP_FIRST);

        assertEquals(1, jobApplicationRepository.findAll().size());
        assertEquals("Second", jobApplication.getCompany());
        assertEquals("OtherRole", jobApplication.getRole());
        assertEquals(INTERVIEW, jobApplication.getStatus());
        assertEquals("Other Notes", jobApplication.getNotes());
        assertEquals("Other Url", jobApplication.getJobPostingUrl());
    }

    @Test
    @Sql({"/sql/cleanup.sql", "/sql/board_existing_moving.sql"})
    void updateStatusMovesToEndOfNewColumn() {
        jobApplicationService.updateJobApplication(
                APP_MOVING,
                mutation("Moving", "Role", APPLIED),
                USER_ID
        );
        refreshPersistence(entityManager);

        var moved = placementFor(placementRepository, APP_MOVING);
        assertEquals(APPLIED, moved.getStatus());
        assertEquals(1, moved.getPosition());
        assertEquals(List.of(0, 1), positionsIn(placementRepository, USER_ID, APPLIED));
    }

    @Test
    @Sql({"/sql/cleanup.sql", "/sql/board_abc_wishlist.sql"})
    void deleteRemovesApplicationAndDensifiesColumn() {
        jobApplicationService.deleteJobApplication(APP_B, USER_ID);
        refreshPersistence(entityManager);

        assertEquals(2, jobApplicationRepository.count());
        assertEquals(2, placementRepository.count());
        assertEquals(List.of(0, 1), positionsIn(placementRepository, USER_ID, WISHLIST));
        assertThrows(ResourceNotFoundException.class, () ->
                jobApplicationService.getJobApplicationById(APP_B, USER_ID)
        );
    }
}
