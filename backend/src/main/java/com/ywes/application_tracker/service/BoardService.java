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
    public List<JobApplicationBoardItem> getBoard() {
        return repo.findAllWithApplicationOrdered().stream()
                .map(JobApplicationBoardItem::from)
                .toList();
    }

    @Transactional
    public void moveJobApplication(int id, JobApplicationPatch patch) {
        BoardPlacement currentPlacement = repo.findById(id).orElseThrow(() ->
            new ResourceNotFoundException("Job application with id " + id + " not found")
        );

        move(currentPlacement, patch.getStatus(), patch.getColumnPosition());
    }

    public int getStatusCount(JobApplicationStatus status) {
        return repo.countByStatus(status);
    }

    public void compactColumnOnRemove(int id, JobApplicationStatus status, int position) {
        repo.parkPlacement(id, PARK_OFFSET);
        repo.compactColumnOnRemove(id, status, position);
    }

    @Transactional
    public void move(
            BoardPlacement placement,
            JobApplicationStatus toStatus,
            Integer toPosition
    ) {
        int id = placement.getApplicationId();
        JobApplicationStatus fromStatus = placement.getStatus();
        int fromPosition = placement.getPosition();

        int endPosition = repo.countByStatus(toStatus);
        int position = toPosition != null ? toPosition : endPosition;

        if (position > endPosition) {
            throw new IllegalPositionException("Maximum position is " + endPosition);
        }

        compactColumnOnRemove(id, fromStatus, fromPosition);
        repo.incrementColumnOnAdd(id, toStatus, position);

        placement.getApplication().setStatus(toStatus);
        placement.setStatus(toStatus);
        placement.setPosition(position);
        repo.save(placement);
    }
}
