package com.example.application_tracker.controller;

import com.example.application_tracker.dto.JobApplicationBoardItem;
import com.example.application_tracker.dto.JobApplicationPatch;
import com.example.application_tracker.service.BoardReorderService;
import com.example.application_tracker.service.BoardService;
import com.example.application_tracker.service.JobApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
public class BoardController {
    @Autowired private BoardService boardService;
    @Autowired private BoardReorderService boardReorderService;

    @GetMapping("/board")
    public List<JobApplicationBoardItem> getJobApplications() {
        return boardService.getBoard();
    }

    @PatchMapping("/board/move/{id}")
    public ResponseEntity<Void> moveJobApplication(@PathVariable int id, @RequestBody JobApplicationPatch patch) {
        return boardReorderService.moveJobApplication(id, patch)
                ?  ResponseEntity.ok().build()
                :  ResponseEntity.notFound().build();
    }
}
