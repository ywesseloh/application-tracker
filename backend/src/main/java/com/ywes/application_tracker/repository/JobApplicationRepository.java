package com.ywes.application_tracker.repository;

import com.ywes.application_tracker.dto.JobApplicationItem;
import com.ywes.application_tracker.model.JobApplication;
import com.ywes.application_tracker.model.JobApplicationStatus;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Integer> {
    @Query("""
            SELECT new com.ywes.application_tracker.dto.JobApplicationItem(
                j.id, j.company, j.role, j.status, j.notes, j.jobPostingUrl
            )
            FROM JobApplication j
            WHERE j.user.id = :userId
            """)
    List<JobApplicationItem> findAllItemsByUserId(Integer userId);

    Optional<JobApplication> findByIdAndUserId(Integer id, Integer userId);

    @Modifying
    @Transactional
    @Query("""
            UPDATE JobApplication p
            SET p.status = :status
            WHERE p.id = :applicationId AND p.user.id = :userId
            """)
    void patchStatus(int applicationId, Integer userId, JobApplicationStatus status);
}
