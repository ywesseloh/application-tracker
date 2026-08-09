package com.ywes.application_tracker.controller;

import com.ywes.application_tracker.dto.JobApplicationBoardItem;
import com.ywes.application_tracker.dto.JobApplicationPatch;
import com.ywes.application_tracker.security.AuthUser;
import com.ywes.application_tracker.service.BoardService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api")
public class BoardController {
    @Autowired private BoardService boardService;

    @GetMapping("/board")
    public List<JobApplicationBoardItem> getJobApplications(@AuthenticationPrincipal AuthUser authUser) {
        return boardService.getBoard(authUser.id());
    }

    @PatchMapping("/board/move/{id}")
    public void moveJobApplication(
            @AuthenticationPrincipal AuthUser authUser,
            @PathVariable int id,
            @Valid @RequestBody JobApplicationPatch patch
    ) {
        boardService.moveJobApplication(id, patch, authUser.id());
    }
}
