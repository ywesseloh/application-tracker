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

    @Transactional
    public boolean moveJobApplication(int id, JobApplicationPatch patch) {
        BoardPlacement currentPlacement = repo.findById(id).orElse(null);
        if (currentPlacement == null) { return false; }

        move(currentPlacement, patch.getStatus(), patch.getColumnPosition());
        return true;
    }

    public int getStatusCount(JobApplicationStatus status) {
        return repo.countByStatus(status);
    }

    public void densifyColumn(JobApplicationStatus status, int position) {
        repo.compactColumnOnRemove(status, position);
    }

    public void move(
            BoardPlacement placement,
            JobApplicationStatus toStatus,
            Integer toPosition
    ) {
        JobApplicationStatus fromStatus = placement.getStatus();
        int fromPosition = placement.getPosition();
        int position = toPosition != null ? toPosition : repo.countByStatus(toStatus);

        densifyColumn(fromStatus, fromPosition);
        repo.incrementColumnOnAdd(toStatus, position);

        placement.setStatus(toStatus);
        placement.setPosition(position);
        repo.save(placement);
    }
}
