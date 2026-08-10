package com.ywes.application_tracker.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

import static com.ywes.application_tracker.support.ApplicationTrackerTestSupport.APP_ALPHA;
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
@WithMockUser(username = "1")
@Sql({"/sql/cleanup.sql", "/sql/board_alpha_beta.sql"})
class JobApplicationControllerTest {
    @Autowired private MockMvc mockMvc;

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
        mockMvc.perform(get("/api/applications/{id}", APP_ALPHA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(APP_ALPHA))
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
        mockMvc.perform(put("/api/applications/{id}", APP_ALPHA)
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

        mockMvc.perform(get("/api/applications/{id}", APP_ALPHA))
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
        mockMvc.perform(delete("/api/applications/{id}", APP_ALPHA))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/applications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].company").value("Beta"));

        mockMvc.perform(get("/api/applications/{id}", APP_ALPHA))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteApplicationUnknownIdReturnsNotFound() throws Exception {
        mockMvc.perform(delete("/api/applications/{id}", 9999))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Job application with id 9999 not found"));
    }

    @Test
    void postApplicationMissingCompanyReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "company": "",
                                  "role": "Engineer",
                                  "status": "WISHLIST"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$[0]").value("Company is mandatory"));
    }

    @Test
    void putApplicationMissingStatusReturnsBadRequest() throws Exception {
        mockMvc.perform(put("/api/applications/{id}", APP_ALPHA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "company": "Alpha",
                                  "role": "Engineer",
                                  "status": null
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$[0]").value("Status is mandatory"));
    }
}
