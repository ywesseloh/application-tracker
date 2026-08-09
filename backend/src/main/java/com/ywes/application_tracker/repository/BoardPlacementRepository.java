package com.ywes.application_tracker.repository;

import com.ywes.application_tracker.model.BoardPlacement;
import com.ywes.application_tracker.model.JobApplicationStatus;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BoardPlacementRepository extends JpaRepository<BoardPlacement, Integer> {
    int countByUserIdAndStatus(Integer userId, JobApplicationStatus status);

    Optional<BoardPlacement> findByApplicationIdAndUserId(Integer applicationId, Integer userId);

    @Modifying
    @Transactional
    @Query("""
            UPDATE BoardPlacement p
            SET p.position = p.position - 1
            WHERE p.id <> :id
              AND p.userId = :userId
              AND p.status = :status
              AND p.position > :removePosition
            """)
    void compactColumnOnRemove(int id, Integer userId, JobApplicationStatus status, int removePosition);

    @Modifying
    @Transactional
    @Query("""
            UPDATE BoardPlacement p
            SET p.position = p.position + 1
            WHERE p.id <> :id
              AND p.userId = :userId
              AND p.status = :status
              AND p.position >= :position
            """)
    void incrementColumnOnAdd(int id, Integer userId, JobApplicationStatus status, int position);

    @Modifying
    @Transactional
    @Query("""
            UPDATE BoardPlacement p
            SET p.position = :offset + p.applicationId
            WHERE p.applicationId = :id
            """)
    void parkPlacement(int id, int offset);

    @Query("""
            SELECT p FROM BoardPlacement p
            JOIN FETCH p.application
            WHERE p.userId = :userId
            ORDER BY p.status ASC, p.position ASC
            """)
    List<BoardPlacement> findAllWithApplicationOrdered(Integer userId);
}
