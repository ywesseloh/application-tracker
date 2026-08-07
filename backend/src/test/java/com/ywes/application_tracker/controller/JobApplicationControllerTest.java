package com.ywes.application_tracker.controller;

import com.ywes.application_tracker.repository.JobApplicationRepository;
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
import static com.ywes.application_tracker.support.BoardTestSupport.findApplicationId;
import static com.ywes.application_tracker.support.BoardTestSupport.mutation;
import static com.ywes.application_tracker.support.BoardTestSupport.seed;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class JobApplicationControllerTest {
    @Autowired private MockMvc mockMvc;
    @Autowired private JobApplicationService jobApplicationService;
    @Autowired private JobApplicationRepository jobApplicationRepository;

    private int alphaId;

    @BeforeEach
    void setUp() {
        jobApplicationRepository.deleteAll();
        seed(
                jobApplicationService,
                mutation("Alpha", "Engineer", WISHLIST),
                mutation("Beta", "Designer", APPLIED)
        );
        alphaId = findApplicationId(jobApplicationRepository, "Alpha");
    }

    @Test
    void getApplicationsReturnsAllItems() throws Exception {
        mockMvc.perform(get("/api/applications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].company").value("Alpha"))
                .andExpect(jsonPath("$[0].role").value("Engineer"))
                .andExpect(jsonPath("$[0].status").value("WISHLIST"))
                .andExpect(jsonPath("$[1].company").value("Beta"))
                .andExpect(jsonPath("$[1].status").value("APPLIED"));
    }

    @Test
    void getApplicationByIdReturnsItem() throws Exception {
        mockMvc.perform(get("/api/applications/{id}", alphaId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(alphaId))
                .andExpect(jsonPath("$.company").value("Alpha"))
                .andExpect(jsonPath("$.role").value("Engineer"))
                .andExpect(jsonPath("$.status").value("WISHLIST"));
    }

    @Test
    void getApplicationByIdUnknownReturnsNotFound() throws Exception {
        mockMvc.perform(get("/api/applications/{id}", 9999))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Job application with id 9999 not found"));
    }

    @Test
    void postApplicationCreatesItem() throws Exception {
        mockMvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "company": "Gamma",
                                  "role": "PM",
                                  "status": "INTERVIEW",
                                  "notes": null,
                                  "jobPostingUrl": null
                                }
                                """))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/applications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[2].company").value("Gamma"))
                .andExpect(jsonPath("$[2].role").value("PM"))
                .andExpect(jsonPath("$[2].status").value("INTERVIEW"));
    }

    @Test
    void putApplicationUpdatesItem() throws Exception {
        mockMvc.perform(put("/api/applications/{id}", alphaId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "company": "Alpha Updated",
                                  "role": "Staff Engineer",
                                  "status": "APPLIED",
                                  "notes": "Referred",
                                  "jobPostingUrl": "https://example.com/jobs/alpha"
                                }
                                """))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/applications/{id}", alphaId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.company").value("Alpha Updated"))
                .andExpect(jsonPath("$.role").value("Staff Engineer"))
                .andExpect(jsonPath("$.status").value("APPLIED"))
                .andExpect(jsonPath("$.notes").value("Referred"))
                .andExpect(jsonPath("$.jobPostingUrl").value("https://example.com/jobs/alpha"));
    }

    @Test
    void putApplicationUnknownIdReturnsNotFound() throws Exception {
        mockMvc.perform(put("/api/applications/{id}", 9999)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "company": "Ghost",
                                  "role": "Role",
                                  "status": "WISHLIST",
                                  "notes": null,
                                  "jobPostingUrl": null
                                }
                                """))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Job application with id 9999 not found"));
    }

    @Test
    void deleteApplicationRemovesItem() throws Exception {
        mockMvc.perform(delete("/api/applications/{id}", alphaId))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/applications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].company").value("Beta"));

        mockMvc.perform(get("/api/applications/{id}", alphaId))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteApplicationUnknownIdReturnsNotFound() throws Exception {
        mockMvc.perform(delete("/api/applications/{id}", 9999))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Job application with id 9999 not found"));
    }
}
