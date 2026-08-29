package com.ywes.application_tracker.service;

import com.ywes.application_tracker.exceptions.IllegalPositionException;
import com.ywes.application_tracker.exceptions.ResourceNotFoundException;
import com.ywes.application_tracker.repository.BoardPlacementRepository;
import com.ywes.application_tracker.repository.JobApplicationRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.ywes.application_tracker.model.JobApplicationStatus.APPLIED;
import static com.ywes.application_tracker.model.JobApplicationStatus.WISHLIST;
import static com.ywes.application_tracker.support.ApplicationTrackerTestSupport.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@Transactional
class BoardServiceTest {
    @Autowired private BoardService boardService;
    @Autowired private BoardPlacementRepository placementRepository;
    @Autowired private JobApplicationRepository jobApplicationRepository;
    @Autowired private EntityManager entityManager;

    @Test
    @Sql({"/sql/cleanup.sql", "/sql/board_abc_wishlist.sql"})
    void moveWithinColumnReordersAndDensifies() {
        boardService.moveJobApplication(APP_C, patch(WISHLIST, 0), USER_ID);
        refreshPersistence(entityManager);

        assertEquals(List.of("C", "A", "B"), companiesIn(placementRepository, USER_ID, WISHLIST));
        assertEquals(List.of(0, 1, 2), positionsIn(placementRepository, USER_ID, WISHLIST));
    }

    @Test
    @Sql({"/sql/cleanup.sql", "/sql/board_wish_applied.sql"})
    void moveAcrossColumnsCompactsSourceAndInsertsIntoTarget() {
        boardService.moveJobApplication(APP_WISH, patch(APPLIED, 0), USER_ID);
        refreshPersistence(entityManager);

        assertEquals(List.of(), companiesIn(placementRepository, USER_ID, WISHLIST));
        assertEquals(List.of("Wish", "AppliedA", "AppliedB"), companiesIn(placementRepository, USER_ID, APPLIED));
        assertEquals(List.of(0, 1, 2), positionsIn(placementRepository, USER_ID, APPLIED));
    }

    @Test
    @Sql({"/sql/cleanup.sql", "/sql/board_wish_applied.sql"})
    void moveAcrossColumnsUpdatesStatusInJobApplicationTable() {
        boardService.moveJobApplication(APP_WISH, patch(APPLIED, 0), USER_ID);
        refreshPersistence(entityManager);

        assertEquals(List.of(), applicationsIn(jobApplicationRepository, USER_ID, WISHLIST));
        assertEquals(List.of("Wish", "AppliedA", "AppliedB"), companiesIn(jobApplicationRepository, USER_ID, APPLIED));
    }

    @Test
    @Sql({"/sql/cleanup.sql", "/sql/board_wish_applied.sql"})
    void appendMovesToEndOfTargetColumn() {
        int appliedCountBefore = boardService.getStatusCount(APPLIED, USER_ID);
        var placement = placementRepository.findById(APP_WISH).orElseThrow();

        boardService.move(placement, APPLIED, null);
        refreshPersistence(entityManager);

        var moved = placementFor(placementRepository, APP_WISH);
        assertEquals(APPLIED, moved.getStatus());
        assertEquals(appliedCountBefore, moved.getPosition());
        assertEquals(List.of(0, 1, 2), positionsIn(placementRepository, USER_ID, APPLIED));
    }

    @Test
    @Sql({"/sql/cleanup.sql", "/sql/board_single_applied.sql"})
    void illegalPositionThrows() {
        assertThrows(IllegalPositionException.class, () ->
                boardService.moveJobApplication(APP_ONLY, patch(APPLIED, 5), USER_ID)
        );
    }

    @Test
    @Sql({"/sql/cleanup.sql", "/sql/user.sql"})
    void unknownIdThrowsNotFound() {
        assertThrows(ResourceNotFoundException.class, () ->
                boardService.moveJobApplication(9999, patch(WISHLIST, 0), USER_ID)
        );
    }
}
