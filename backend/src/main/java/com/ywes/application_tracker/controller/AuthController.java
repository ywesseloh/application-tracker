package com.ywes.application_tracker.controller;

import com.ywes.application_tracker.common.BadRefreshTokenException;
import com.ywes.application_tracker.dto.AccessTokenResponse;
import com.ywes.application_tracker.dto.AuthTokenPair;
import com.ywes.application_tracker.dto.UserMutation;
import com.ywes.application_tracker.config.RefreshTokenCookieProperties;
import com.ywes.application_tracker.service.RefreshTokenCookieService;
import com.ywes.application_tracker.service.AuthService;
import com.ywes.application_tracker.service.RefreshTokenService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AuthController {
    @Autowired
    private AuthService authService;
    @Autowired
    private RefreshTokenService refreshTokenService;
    @Autowired
    private RefreshTokenCookieService refreshTokenCookieService;
    @Autowired
    private RefreshTokenCookieProperties refreshTokenCookieProperties;

    @PostMapping("/auth/login")
    public AccessTokenResponse login(
            @Valid @RequestBody UserMutation userMutation,
            HttpServletResponse response
    ) {
        AuthTokenPair tokens = authService.login(userMutation);
        refreshTokenCookieService.writeCookie(response, tokens.rawRefreshToken());
        return new AccessTokenResponse(tokens.jwt());
    }

    @PostMapping("/auth/refresh")
    public AccessTokenResponse applyRefreshToken(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        String refreshToken = readRefreshCookie(request);
        if (refreshToken == null) {
            throw new BadRefreshTokenException("Missing refresh token");
        }

        AuthTokenPair tokens = refreshTokenService.applyRefreshToken(refreshToken);
        refreshTokenCookieService.writeCookie(response, tokens.rawRefreshToken());
        return new AccessTokenResponse(tokens.jwt());
    }

    @PostMapping("/auth/logout")
    public void logout(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        refreshTokenService.revokeRefreshToken(readRefreshCookie(request));
        refreshTokenCookieService.clearCookie(response);
    }

    private String readRefreshCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }

        for (Cookie cookie : cookies) {
            if (refreshTokenCookieProperties.getCookieName().equals(cookie.getName())
                    && cookie.getValue() != null
                    && !cookie.getValue().isBlank()) {
                return cookie.getValue();
            }
        }

        return null;
    }
}
