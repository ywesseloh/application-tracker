package com.example.application_tracker.repository;

import com.example.application_tracker.model.JobApplication;
import com.example.application_tracker.model.JobApplicationStatus;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Integer> {
    @Modifying
    @Transactional
    @Query("""
            UPDATE JobApplication p
            SET p.status = :status
            WHERE p.id = :applicationId
            """)
    int patchStatus(int applicationId, JobApplicationStatus status);
}
