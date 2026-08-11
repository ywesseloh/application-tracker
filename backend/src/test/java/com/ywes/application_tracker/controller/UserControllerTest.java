package com.ywes.application_tracker.controller;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.ywes.application_tracker.repository.RefreshTokenRepository;
import com.ywes.application_tracker.service.RefreshTokenService;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.emptyOrNullString;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
    @Autowired private RefreshTokenRepository refreshTokenRepository;
    @Autowired private RefreshTokenService refreshTokenService;

    @Test
    @Sql("/sql/cleanup.sql")
    void registerCreatesUserThatCanLogin() throws Exception {
        mockMvc.perform(post("/api/register")
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
        mockMvc.perform(post("/api/register")
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
        mockMvc.perform(post("/api/register")
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
        mockMvc.perform(post("/api/register")
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
        mockMvc.perform(post("/api/register")
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
        mockMvc.perform(post("/api/register")
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
    void loginReturnsJwt() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "mock-user",
                                  "password": "password"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.jwt", not(emptyOrNullString())))
                .andExpect(jsonPath("$.refreshToken").doesNotExist())
                .andExpect(header().string("Set-Cookie", containsString(REFRESH_COOKIE_NAME)))
                .andExpect(header().string("Set-Cookie", containsString("HttpOnly")));
    }

    @Test
    @Sql({"/sql/cleanup.sql", "/sql/user.sql"})
    void loginWrongPasswordIsRejected() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "mock-user",
                                  "password": "wrong"
                                }
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Sql({"/sql/cleanup.sql", "/sql/user.sql"})
    void loginUnknownUserIsRejected() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "nobody",
                                  "password": "password"
                                }
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Sql({"/sql/cleanup.sql", "/sql/user.sql"})
    void loginMissingUsernameReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": null,
                                  "password": "password"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$[0]").value("Username is mandatory"));
    }

    @Test
    @Sql({"/sql/cleanup.sql", "/sql/user.sql"})
    void refreshWithCookieReturnsNewJwt() throws Exception {
        LoginSession session = loginAsMockUser();

        mockMvc.perform(post("/api/auth/refresh")
                        .cookie(session.refreshCookie()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.jwt", not(emptyOrNullString())))
                .andExpect(jsonPath("$.refreshToken").doesNotExist())
                .andExpect(header().string("Set-Cookie", containsString(REFRESH_COOKIE_NAME)));
    }

    @Test
    @Sql({"/sql/cleanup.sql", "/sql/user.sql"})
    void refreshWithoutCookieIsRejected() throws Exception {
        mockMvc.perform(post("/api/auth/refresh"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Sql({"/sql/cleanup.sql", "/sql/user.sql"})
    void revokeRefreshTokenDeletesStoredToken() throws Exception {
        LoginSession session = loginAsMockUser();
        assertEquals(1, refreshTokenRepository.count());

        refreshTokenService.revokeRefreshToken(session.refreshCookie().getValue());

        assertEquals(0, refreshTokenRepository.count());
    }

    @Test
    @Sql({"/sql/cleanup.sql", "/sql/user.sql"})
    void logoutClearsCookieAndRevokesRefreshToken() throws Exception {
        LoginSession session = loginAsMockUser();
        assertEquals(1, refreshTokenRepository.count());

        mockMvc.perform(post("/api/auth/logout")
                        .cookie(session.refreshCookie()))
                .andExpect(status().isOk())
                .andExpect(header().string("Set-Cookie", containsString(REFRESH_COOKIE_NAME + "=")))
                .andExpect(header().string("Set-Cookie", containsString("Max-Age=0")));

        assertEquals(0, refreshTokenRepository.count());

        mockMvc.perform(post("/api/auth/refresh")
                        .cookie(session.refreshCookie()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Sql({"/sql/cleanup.sql", "/sql/board_alpha_beta.sql"})
    void protectedRouteWithoutTokenIsRejected() throws Exception {
        mockMvc.perform(get("/api/applications"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Sql({"/sql/cleanup.sql", "/sql/board_alpha_beta.sql"})
    void protectedRouteWithValidJwtSucceeds() throws Exception {
        LoginSession session = loginAsMockUser();

        mockMvc.perform(get("/api/applications")
                        .header("Authorization", "Bearer " + session.jwt()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].company").value("Alpha"))
                .andExpect(jsonPath("$[1].company").value("Beta"));
    }

    @Test
    @Sql({"/sql/cleanup.sql", "/sql/board_alpha_beta.sql"})
    void protectedRouteWithInvalidJwtIsRejected() throws Exception {
        mockMvc.perform(get("/api/applications")
                        .header("Authorization", "Bearer not-a-valid-jwt"))
                .andExpect(status().isUnauthorized());
    }

    private LoginSession loginAsMockUser() throws Exception {
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
        Cookie refreshCookie = result.getResponse().getCookie(REFRESH_COOKIE_NAME);
        if (refreshCookie == null) {
            throw new IllegalStateException("Expected refresh cookie after login");
        }

        return new LoginSession(body.get("jwt").asText(), refreshCookie);
    }

    private record LoginSession(String jwt, Cookie refreshCookie) {
    }
}
