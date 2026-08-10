package com.ywes.application_tracker.service;

import com.ywes.application_tracker.dto.LoginResponse;
import com.ywes.application_tracker.dto.UserMutation;
import com.ywes.application_tracker.model.RefreshToken;
import com.ywes.application_tracker.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class AuthService {
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private RefreshTokenService refreshTokenService;

    public LoginResponse login(UserMutation userMutation) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(userMutation.username(), userMutation.password())
        );

        User user = (User) authentication.getPrincipal();
        String jwt = jwtService.generateToken(user.getId(), user.getUsername());
        String refreshToken = refreshTokenService.getOrCreateRefreshToken(user.getId());
        return new LoginResponse(jwt, refreshToken);
    }

    public void logout(Integer userId) {
        refreshTokenService.deleteRefreshToken(userId);
    }
}
