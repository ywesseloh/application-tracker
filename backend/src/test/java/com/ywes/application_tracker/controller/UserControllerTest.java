package com.ywes.application_tracker.controller;

import com.ywes.application_tracker.repository.BoardPlacementRepository;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.ywes.application_tracker.repository.JobApplicationRepository;
import com.ywes.application_tracker.repository.RefreshTokenRepository;
import com.ywes.application_tracker.repository.UserRepository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.emptyOrNullString;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class UserControllerTest {
    private static final String REFRESH_COOKIE_NAME = "refresh_token";

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private RefreshTokenRepository refreshTokenRepository;
    @Autowired private JobApplicationRepository jobApplicationRepository;
    @Autowired private BoardPlacementRepository boardPlacementRepository;

    @Test
    @Sql("/sql/cleanup.sql")
    void registerCreatesUserThatCanLogin() throws Exception {
        mockMvc.perform(post("/api/user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "newuser",
                                  "password": "secret"
                                }
                                """))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "newuser",
                                  "password": "secret"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.jwt", not(emptyOrNullString())))
                .andExpect(jsonPath("$.refreshToken").doesNotExist())
                .andExpect(header().string("Set-Cookie", containsString(REFRESH_COOKIE_NAME)))
                .andExpect(header().string("Set-Cookie", containsString("HttpOnly")));
    }

    @Test
    @Sql("/sql/cleanup.sql")
    void registerMissingUsernameReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": null,
                                  "password": "secret"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$[0]").value("Username is mandatory"));
    }

    @Test
    @Sql("/sql/cleanup.sql")
    void registerMissingPasswordReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "newuser",
                                  "password": null
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$[0]").value("Password is mandatory"));
    }

    @Test
    @Sql("/sql/cleanup.sql")
    void registerOversizedUsernameReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "abcdefghijklmnopqrstu",
                                  "password": "secret"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$[0]").value("Username can have a maximum of 20 characters"));
    }

    @Test
    @Sql("/sql/cleanup.sql")
    void registerOversizedPasswordReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "newuser",
                                  "password": "abcdefghijklmnopqrstu"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$[0]").value("Password can have a maximum of 20 characters"));
    }

    @Test
    @Sql({"/sql/cleanup.sql", "/sql/user.sql"})
    void registerDuplicateUsernameReturnsConflict() throws Exception {
        mockMvc.perform(post("/api/user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "mock-user",
                                  "password": "secret"
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$").value("Username already exists: mock-user"));
    }

    @Test
    @Sql({"/sql/cleanup.sql", "/sql/user.sql"})
    void deleteUserWithoutTokenIsRejected() throws Exception {
        mockMvc.perform(delete("/api/user"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Sql({"/sql/cleanup.sql", "/sql/user.sql"})
    void deleteUserWithInvalidJwtIsRejected() throws Exception {
        mockMvc.perform(delete("/api/user")
                        .header("Authorization", "Bearer not-a-valid-jwt"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Sql({"/sql/cleanup.sql", "/sql/user.sql"})
    void deleteUserWithValidJwtRemovesUser() throws Exception {
        String jwt = loginAsMockUser();

        mockMvc.perform(delete("/api/user")
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk());

        assertFalse(userRepository.existsByUsername("mock-user"));
        assertEquals(0, refreshTokenRepository.count());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "mock-user",
                                  "password": "password"
                                }
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Sql({"/sql/cleanup.sql", "/sql/board_alpha_beta.sql"})
    void deleteUserCascadesApplicationsAndBoardPlacements() throws Exception {
        String jwt = loginAsMockUser();
        assertEquals(2, jobApplicationRepository.count());

        mockMvc.perform(delete("/api/user")
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk());

        assertFalse(userRepository.existsByUsername("mock-user"));
        assertEquals(0, jobApplicationRepository.count());
        assertEquals(0, boardPlacementRepository.count());
    }

    private String loginAsMockUser() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "mock-user",
                                  "password": "password"
                                }
                                """))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        return body.get("jwt").asText();
    }
}
