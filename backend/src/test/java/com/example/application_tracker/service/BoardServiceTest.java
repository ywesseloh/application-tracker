package com.example.application_tracker.service;

import com.example.application_tracker.common.IllegalPositionException;
import com.example.application_tracker.common.ResourceNotFoundException;
import com.example.application_tracker.repository.BoardPlacementRepository;
import com.example.application_tracker.repository.JobApplicationRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.example.application_tracker.model.JobApplicationStatus.APPLIED;
import static com.example.application_tracker.model.JobApplicationStatus.WISHLIST;
import static com.example.application_tracker.support.BoardTestSupport.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@Transactional
class BoardServiceTest {
    @Autowired private BoardService boardService;
    @Autowired private JobApplicationService jobApplicationService;
    @Autowired private BoardPlacementRepository placementRepository;
    @Autowired private JobApplicationRepository jobApplicationRepository;
    @Autowired private EntityManager entityManager;

    @Test
    void moveWithinColumnReordersAndDensifies() {
        seed(
                jobApplicationService,
                mutation("A", "Role A", WISHLIST),
                mutation("B", "Role B", WISHLIST),
                mutation("C", "Role C", WISHLIST)
        );

        int cId = findApplicationId(jobApplicationRepository, "C");
        boardService.moveJobApplication(cId, patch(WISHLIST, 0));
        refreshPersistence(entityManager);

        assertEquals(List.of("C", "A", "B"), companiesIn(placementRepository, WISHLIST));
        assertEquals(List.of(0, 1, 2), positionsIn(placementRepository, WISHLIST));
    }

    @Test
    void moveAcrossColumnsCompactsSourceAndInsertsIntoTarget() {
        seed(
                jobApplicationService,
                mutation("Wish", "Role", WISHLIST),
                mutation("AppliedA", "Role", APPLIED),
                mutation("AppliedB", "Role", APPLIED)
        );

        int wishId = findApplicationId(jobApplicationRepository, "Wish");
        boardService.moveJobApplication(wishId, patch(APPLIED, 0));
        refreshPersistence(entityManager);

        assertEquals(List.of(), companiesIn(placementRepository, WISHLIST));
        assertEquals(List.of("Wish", "AppliedA", "AppliedB"), companiesIn(placementRepository, APPLIED));
        assertEquals(List.of(0, 1, 2), positionsIn(placementRepository, APPLIED));
    }

    @Test
    void appendMovesToEndOfTargetColumn() {
        seed(
                jobApplicationService,
                mutation("MoveMe", "Role", WISHLIST),
                mutation("AppliedA", "Role", APPLIED),
                mutation("AppliedB", "Role", APPLIED)
        );

        int moveId = findApplicationId(jobApplicationRepository, "MoveMe");
        int appliedCountBefore = boardService.getStatusCount(APPLIED);
        var placement = placementRepository.findById(moveId).orElseThrow();

        boardService.move(placement, APPLIED, null);
        refreshPersistence(entityManager);

        var moved = placementFor(placementRepository, moveId);
        assertEquals(APPLIED, moved.getStatus());
        assertEquals(appliedCountBefore, moved.getPosition());
        assertEquals(List.of(0, 1, 2), positionsIn(placementRepository, APPLIED));
    }

    @Test
    void illegalPositionThrows() {
        seed(jobApplicationService, mutation("Only", "Role", APPLIED));

        int id = findApplicationId(jobApplicationRepository, "Only");
        assertThrows(IllegalPositionException.class, () ->
                boardService.moveJobApplication(id, patch(APPLIED, 5))
        );
    }

    @Test
    void unknownIdThrowsNotFound() {
        assertThrows(ResourceNotFoundException.class, () ->
                boardService.moveJobApplication(9999, patch(WISHLIST, 0))
        );
    }
}
