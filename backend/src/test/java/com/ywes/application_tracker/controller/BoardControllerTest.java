package com.ywes.application_tracker.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

import static com.ywes.application_tracker.dto.ErrorType.*;
import static com.ywes.application_tracker.support.ApplicationTrackerTestSupport.APP_ALPHA;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@WithMockUser(username = "1")
@Sql({"/sql/cleanup.sql", "/sql/board_alpha_beta.sql"})
class BoardControllerTest {
    @Autowired private MockMvc mockMvc;

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
        mockMvc.perform(patch("/api/board/move/{id}", APP_ALPHA)
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
                .andExpect(jsonPath("$.errorType").value(RESOURCE_NOT_FOUND.toString()));;
    }

    @Test
    void patchMoveIllegalPositionReturnsBadRequest() throws Exception {
        mockMvc.perform(patch("/api/board/move/{id}", APP_ALPHA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"APPLIED\",\"columnPosition\":99}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorType").value(ILLEGAL_COLUMN_POSITION.toString()));
    }

    @Test
    void patchMoveMissingStatusReturnsBadRequest() throws Exception {
        mockMvc.perform(patch("/api/board/move/{id}", APP_ALPHA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":null,\"columnPosition\":0}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorType").value(INVALID_REQUEST_BODY.toString()));
    }

    @Test
    void patchMoveNegativePositionReturnsBadRequest() throws Exception {
        mockMvc.perform(patch("/api/board/move/{id}", APP_ALPHA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"APPLIED\",\"columnPosition\":-1}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorType").value(INVALID_REQUEST_BODY.toString()));
    }
}
