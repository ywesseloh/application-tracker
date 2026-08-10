package com.ywes.application_tracker.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.emptyOrNullString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class UserControllerTest {
    @Autowired private MockMvc mockMvc;

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

        mockMvc.perform(post("/api/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "newuser",
                                  "password": "secret"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(content().string(not(emptyOrNullString())));
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
    void loginReturnsJwt() throws Exception {
        mockMvc.perform(post("/api/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "mock-user",
                                  "password": "password"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(content().string(not(emptyOrNullString())));
    }

    @Test
    @Sql({"/sql/cleanup.sql", "/sql/user.sql"})
    void loginWrongPasswordIsRejected() throws Exception {
        mockMvc.perform(post("/api/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "mock-user",
                                  "password": "wrong"
                                }
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    @Sql({"/sql/cleanup.sql", "/sql/user.sql"})
    void loginUnknownUserIsRejected() throws Exception {
        mockMvc.perform(post("/api/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "nobody",
                                  "password": "password"
                                }
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    @Sql({"/sql/cleanup.sql", "/sql/user.sql"})
    void loginMissingUsernameReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/login")
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
    @Sql({"/sql/cleanup.sql", "/sql/board_alpha_beta.sql"})
    void protectedRouteWithoutTokenIsRejected() throws Exception {
        mockMvc.perform(get("/api/applications"))
                .andExpect(status().isForbidden());
    }

    @Test
    @Sql({"/sql/cleanup.sql", "/sql/board_alpha_beta.sql"})
    void protectedRouteWithValidJwtSucceeds() throws Exception {
        String token = loginAsMockUser();

        mockMvc.perform(get("/api/applications")
                        .header("Authorization", "Bearer " + token))
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

    private String loginAsMockUser() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username": "mock-user",
                                  "password": "password"
                                }
                                """))
                .andExpect(status().isOk())
                .andReturn();
        return result.getResponse().getContentAsString();
    }
}
