package com.ywes.application_tracker.controller;

import com.ywes.application_tracker.repository.JobApplicationRepository;
import com.ywes.application_tracker.service.BoardService;
import com.ywes.application_tracker.service.JobApplicationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static com.ywes.application_tracker.model.JobApplicationStatus.APPLIED;
import static com.ywes.application_tracker.model.JobApplicationStatus.WISHLIST;
import static com.ywes.application_tracker.support.BoardTestSupport.*;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class BoardControllerTest {
    @Autowired private MockMvc mockMvc;
    @Autowired private JobApplicationService jobApplicationService;
    @Autowired private JobApplicationRepository jobApplicationRepository;
    @Autowired private BoardService boardService;

    private int wishlistId;

    @BeforeEach
    void setUp() {
        jobApplicationRepository.deleteAll();
        seed(
                jobApplicationService,
                mutation("Alpha", "Role", WISHLIST),
                mutation("Beta", "Role", APPLIED)
        );
        wishlistId = findApplicationId(jobApplicationRepository, "Alpha");
    }

    @Test
    void getBoardReturnsOrderedApplications() throws Exception {
        mockMvc.perform(get("/api/board"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].company").value("Beta"))
                .andExpect(jsonPath("$[0].status").value("APPLIED"))
                .andExpect(jsonPath("$[0].columnPosition").value(0))
                .andExpect(jsonPath("$[1].company").value("Alpha"))
                .andExpect(jsonPath("$[1].status").value("WISHLIST"))
                .andExpect(jsonPath("$[1].columnPosition").value(0));
    }

    @Test
    void patchMoveUpdatesBoard() throws Exception {
        mockMvc.perform(patch("/api/board/move/{id}", wishlistId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"APPLIED\",\"columnPosition\":0}"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/board"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].company").value("Alpha"))
                .andExpect(jsonPath("$[0].status").value("APPLIED"))
                .andExpect(jsonPath("$[0].columnPosition").value(0))
                .andExpect(jsonPath("$[1].company").value("Beta"))
                .andExpect(jsonPath("$[1].status").value("APPLIED"))
                .andExpect(jsonPath("$[1].columnPosition").value(1));
    }

    @Test
    void patchMoveUnknownIdReturnsNotFound() throws Exception {
        mockMvc.perform(patch("/api/board/move/{id}", 9999)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"WISHLIST\",\"columnPosition\":0}"))
                .andExpect(status().isNotFound())
                .andExpect(content().string(
                        "Job application with id 9999 not found"
                ));
    }

    @Test
    void patchMoveIllegalPositionReturnsBadRequest() throws Exception {
        mockMvc.perform(patch("/api/board/move/{id}", wishlistId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"APPLIED\",\"columnPosition\":99}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Maximum position is 1"));
    }

    @Test
    void patchMoveMissingStatusReturnsBadRequest() throws Exception {
        mockMvc.perform(patch("/api/board/move/{id}", wishlistId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":null,\"columnPosition\":0}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$[0]").value("Status is mandatory"));
    }

    @Test
    void patchMoveNegativePositionReturnsBadRequest() throws Exception {
        mockMvc.perform(patch("/api/board/move/{id}", wishlistId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"APPLIED\",\"columnPosition\":-1}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$[0]").value("Position must be zero or greater"));
    }
}
