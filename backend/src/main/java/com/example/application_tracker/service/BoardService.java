package com.example.application_tracker.service;

import com.example.application_tracker.dto.JobApplicationBoardItem;
import com.example.application_tracker.dto.JobApplicationPatch;
import com.example.application_tracker.model.BoardPlacement;
import com.example.application_tracker.model.JobApplicationStatus;
import com.example.application_tracker.repository.BoardPlacementRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BoardService {
    @Autowired private BoardPlacementRepository repo;
    public List<JobApplicationBoardItem> getBoard() {
        return repo.findAllWithApplicationOrdered().stream()
                .map(JobApplicationBoardItem::from)
                .toList();
    }

    public int getStatusCount(JobApplicationStatus status) {
        return repo.countByStatus(status);
    }

    @Transactional
    public void densifyColumn(JobApplicationStatus status, int position) {
        repo.compactAfterRemove(status, position);
    }

    @Transactional
    public void moveToStatus(
            BoardPlacement placement,
            JobApplicationStatus toStatus
    ) {
        densifyColumn(placement.getStatus(), placement.getPosition());
        int position = repo.countByStatus(toStatus);
        repo.patch(placement.getApplicationId(), toStatus, position);
    }

    @Transactional
    public void patch(JobApplicationPatch patch) {
        repo.patch(patch.getId(), patch.getStatus(), patch.getColumnPosition());
    }
}
