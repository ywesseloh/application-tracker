package com.ywes.application_tracker.service;

import com.ywes.application_tracker.common.IllegalPositionException;
import com.ywes.application_tracker.common.ResourceNotFoundException;
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

import static com.ywes.application_tracker.model.JobApplicationStatus.APPLIED;
import static com.ywes.application_tracker.model.JobApplicationStatus.WISHLIST;
import static com.ywes.application_tracker.support.BoardTestSupport.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@Transactional
class BoardServiceTest {
    @Autowired private BoardService boardService;
    @Autowired private JobApplicationService jobApplicationService;
    @Autowired private BoardPlacementRepository placementRepository;
    @Autowired private JobApplicationRepository jobApplicationRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private EntityManager entityManager;

    private User user;
    private Integer userId;

    @BeforeEach
    void setUp() {
        user = persistUser(userRepository, "board-tester");
        userId = user.getId();
    }

    @Test
    void moveWithinColumnReordersAndDensifies() {
        seed(
                jobApplicationService,
                userId,
                mutation("A", "Role A", WISHLIST),
                mutation("B", "Role B", WISHLIST),
                mutation("C", "Role C", WISHLIST)
        );

        int cId = findApplicationId(jobApplicationRepository, "C");
        boardService.moveJobApplication(cId, patch(WISHLIST, 0), userId);
        refreshPersistence(entityManager);

        assertEquals(List.of("C", "A", "B"), companiesIn(placementRepository, user, WISHLIST));
        assertEquals(List.of(0, 1, 2), positionsIn(placementRepository, user, WISHLIST));
    }

    @Test
    void moveAcrossColumnsCompactsSourceAndInsertsIntoTarget() {
        seed(
                jobApplicationService,
                userId,
                mutation("Wish", "Role", WISHLIST),
                mutation("AppliedA", "Role", APPLIED),
                mutation("AppliedB", "Role", APPLIED)
        );

        int wishId = findApplicationId(jobApplicationRepository, "Wish");
        boardService.moveJobApplication(wishId, patch(APPLIED, 0), userId);
        refreshPersistence(entityManager);

        assertEquals(List.of(), companiesIn(placementRepository, user, WISHLIST));
        assertEquals(List.of("Wish", "AppliedA", "AppliedB"), companiesIn(placementRepository, user, APPLIED));
        assertEquals(List.of(0, 1, 2), positionsIn(placementRepository, user, APPLIED));
    }

    @Test
    void moveAcrossColumnsUpdatesStatusInJobApplicationTable() {
        seed(
                jobApplicationService,
                userId,
                mutation("Wish", "Role", WISHLIST),
                mutation("AppliedA", "Role", APPLIED),
                mutation("AppliedB", "Role", APPLIED)
        );

        int wishId = findApplicationId(jobApplicationRepository, "Wish");
        boardService.moveJobApplication(wishId, patch(APPLIED, 0), userId);
        refreshPersistence(entityManager);

        assertEquals(List.of(), applicationsIn(jobApplicationRepository, user, WISHLIST));
        assertEquals(List.of("Wish", "AppliedA", "AppliedB"), companiesIn(jobApplicationRepository, user, APPLIED));
    }

    @Test
    void appendMovesToEndOfTargetColumn() {
        seed(
                jobApplicationService,
                userId,
                mutation("MoveMe", "Role", WISHLIST),
                mutation("AppliedA", "Role", APPLIED),
                mutation("AppliedB", "Role", APPLIED)
        );

        int moveId = findApplicationId(jobApplicationRepository, "MoveMe");
        int appliedCountBefore = boardService.getStatusCount(APPLIED, userId);
        var placement = placementRepository.findById(moveId).orElseThrow();

        boardService.move(placement, APPLIED, null);
        refreshPersistence(entityManager);

        var moved = placementFor(placementRepository, moveId);
        assertEquals(APPLIED, moved.getStatus());
        assertEquals(appliedCountBefore, moved.getPosition());
        assertEquals(List.of(0, 1, 2), positionsIn(placementRepository, user, APPLIED));
    }

    @Test
    void illegalPositionThrows() {
        seed(jobApplicationService, userId, mutation("Only", "Role", APPLIED));

        int id = findApplicationId(jobApplicationRepository, "Only");
        assertThrows(IllegalPositionException.class, () ->
                boardService.moveJobApplication(id, patch(APPLIED, 5), userId)
        );
    }

    @Test
    void unknownIdThrowsNotFound() {
        assertThrows(ResourceNotFoundException.class, () ->
                boardService.moveJobApplication(9999, patch(WISHLIST, 0), userId)
        );
    }
}
