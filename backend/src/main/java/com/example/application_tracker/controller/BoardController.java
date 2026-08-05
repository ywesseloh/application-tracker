package com.example.application_tracker.controller;

import com.example.application_tracker.dto.JobApplicationBoardItem;
import com.example.application_tracker.dto.JobApplicationPatch;
import com.example.application_tracker.service.BoardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
public class BoardController {
    @Autowired private BoardService boardService;

    @GetMapping("/board")
    public List<JobApplicationBoardItem> getJobApplications() {
        return boardService.getBoard();
    }

    @PatchMapping("/board/move/{id}")
    public void moveJobApplication(@PathVariable int id, @RequestBody JobApplicationPatch patch) {
        boardService.moveJobApplication(id, patch);
    }
}
