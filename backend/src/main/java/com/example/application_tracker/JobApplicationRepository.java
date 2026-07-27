package com.example.application_tracker;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Integer> {
    @Modifying
    @Query("UPDATE JobApplication " +
            "SET status = :status, columnPosition = :columnPosition " +
            "WHERE id = :id")
    @Transactional int patch(int id, String status, int columnPosition);
}
