package com.ywes.application_tracker.controller;

import com.ywes.application_tracker.dto.JobApplicationBoardItem;
import com.ywes.application_tracker.dto.JobApplicationPatch;
import com.ywes.application_tracker.utils.CurrentUserId;
import com.ywes.application_tracker.service.BoardService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class BoardController {
    @Autowired private BoardService boardService;

    @GetMapping("/board")
    public List<JobApplicationBoardItem> getJobApplications(@CurrentUserId Integer userId) {
        return boardService.getBoard(userId);
    }

    @PatchMapping("/board/move/{id}")
    public void moveJobApplication(
            @CurrentUserId Integer userId,
            @PathVariable int id,
            @Valid @RequestBody JobApplicationPatch patch
    ) {
        boardService.moveJobApplication(id, patch, userId);
    }
}
