package com.ywes.application_tracker.service;

import com.ywes.application_tracker.common.IllegalPositionException;
import com.ywes.application_tracker.common.ResourceNotFoundException;
import com.ywes.application_tracker.dto.JobApplicationBoardItem;
import com.ywes.application_tracker.dto.JobApplicationPatch;
import com.ywes.application_tracker.model.BoardPlacement;
import com.ywes.application_tracker.model.JobApplicationStatus;
import com.ywes.application_tracker.repository.BoardPlacementRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BoardService {
    private static final int PARK_OFFSET = 1_000_000;
    @Autowired private BoardPlacementRepository repo;

    public List<JobApplicationBoardItem> getBoard(Integer userId) {
        return repo.findAllWithApplicationOrdered(userId).stream()
                .map(JobApplicationBoardItem::from)
                .toList();
    }

    @Transactional
    public void moveJobApplication(int id, JobApplicationPatch patch, Integer userId) {
        BoardPlacement currentPlacement = repo.findByApplicationIdAndUserId(id, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Job application with id " + id + " not found")
                );

        move(currentPlacement, patch.getStatus(), patch.getColumnPosition());
    }

    public int getStatusCount(JobApplicationStatus status, Integer userId) {
        return repo.countByUserIdAndStatus(userId, status);
    }

    public void compactColumnOnRemove(int id, JobApplicationStatus status, int position, Integer userId) {
        repo.parkPlacement(id, PARK_OFFSET);
        repo.compactColumnOnRemove(id, userId, status, position);
    }

    @Transactional
    public void move(
            BoardPlacement placement,
            JobApplicationStatus toStatus,
            Integer toPosition
    ) {
        int id = placement.getApplicationId();
        Integer userId = placement.getUserId();
        JobApplicationStatus fromStatus = placement.getStatus();
        int fromPosition = placement.getPosition();

        int endPosition = repo.countByUserIdAndStatus(userId, toStatus);
        int position = toPosition != null ? toPosition : endPosition;

        if (position > endPosition) {
            throw new IllegalPositionException("Maximum position is " + endPosition);
        }

        repo.parkPlacement(id, PARK_OFFSET);
        repo.compactColumnOnRemove(id, userId, fromStatus, fromPosition);
        repo.incrementColumnOnAdd(id, userId, toStatus, position);

        placement.getApplication().setStatus(toStatus);
        placement.setStatus(toStatus);
        placement.setPosition(position);
        repo.save(placement);
    }
}
