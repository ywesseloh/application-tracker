package com.ywes.application_tracker.controller;

import com.ywes.application_tracker.dto.LoginResponse;
import com.ywes.application_tracker.dto.RefreshMutation;
import com.ywes.application_tracker.dto.UserMutation;
import com.ywes.application_tracker.repository.RefreshTokenRepository;
import com.ywes.application_tracker.security.CurrentUserId;
import com.ywes.application_tracker.service.AuthService;
import com.ywes.application_tracker.service.RefreshTokenService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin
@RestController
@RequestMapping("/api")
public class AuthController {
    @Autowired
    private AuthService authService;
    @Autowired
    private RefreshTokenService refreshTokenService;

    @PostMapping("/auth/login")
    public LoginResponse login(@Valid @RequestBody UserMutation userMutation) {
        return authService.login(userMutation);
    }

    @PostMapping("/auth/refresh")
    public LoginResponse applyRefreshToken(@Valid @RequestBody RefreshMutation refreshMutation) {
        return refreshTokenService.applyRefreshToken(refreshMutation.refreshToken());
    }

    @PostMapping("/auth/logout")
    public void logout(@CurrentUserId Integer userId) {
        authService.logout(userId);
    }
}
