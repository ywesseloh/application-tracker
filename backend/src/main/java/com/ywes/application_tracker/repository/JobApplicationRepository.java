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
@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Integer> {
    @Query("""
            SELECT new com.ywes.application_tracker.dto.JobApplicationItem(
                j.id, j.company, j.role, j.status, j.notes, j.jobPostingUrl
            )
            FROM JobApplication j
            """)
    List<JobApplicationItem> findAllItems();

    @Modifying
    @Transactional
    @Query("""
            UPDATE JobApplication p
            SET p.status = :status
            WHERE p.id = :applicationId
            """)
    void patchStatus(int applicationId, JobApplicationStatus status);
}
