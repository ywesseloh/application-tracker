package com.ywes.application_tracker.service;

import com.ywes.application_tracker.config.RefreshTokenCookieProperties;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class RefreshTokenCookieService {
    private final RefreshTokenCookieProperties properties;

    public RefreshTokenCookieService(RefreshTokenCookieProperties properties) {
        this.properties = properties;
    }

    public void writeCookie(HttpServletResponse response, String rawToken) {
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie(rawToken, cookieMaxAgeSeconds()).toString());
    }

    public void clearCookie(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie("", 0).toString());
    }

    private ResponseCookie buildCookie(String value, long maxAgeSeconds) {
        return ResponseCookie.from(properties.getCookieName(), value)
                .httpOnly(true)
                .path(properties.getCookiePath())
                .maxAge(Duration.ofSeconds(maxAgeSeconds))
                .secure(properties.isCookieSecure())
                .sameSite(properties.getCookieSameSite())
                .build();
    }

    private long cookieMaxAgeSeconds() {
        return Duration.ofMillis(properties.getExpirationTime()).toSeconds();
    }
}
