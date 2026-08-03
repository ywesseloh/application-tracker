package com.example.application_tracker.repository;

import com.example.application_tracker.model.BoardPlacement;
import com.example.application_tracker.model.JobApplicationStatus;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoardPlacementRepository extends JpaRepository<BoardPlacement, Integer> {
    int countByStatus(JobApplicationStatus status);

    @Modifying
    @Transactional
    @Query("""
            UPDATE BoardPlacement p
            SET p.position = p.position - 1
            WHERE p.id <> :id AND p.status = :status AND p.position > :removePosition
            """)
    void compactColumnOnRemove(int id, JobApplicationStatus status, int removePosition);

    @Modifying
    @Transactional
    @Query("""
            UPDATE BoardPlacement p
            SET p.position = p.position + 1
            WHERE p.id <> :id AND p.status = :status AND p.position >= :position
            """)
    void incrementColumnOnAdd(int id, JobApplicationStatus status, int position);

    @Query("""
            SELECT p FROM BoardPlacement p
            JOIN FETCH p.application
            ORDER BY p.status ASC, p.position ASC
            """)
    List<BoardPlacement> findAllWithApplicationOrdered();
}
