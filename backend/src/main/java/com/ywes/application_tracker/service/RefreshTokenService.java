package com.ywes.application_tracker.service;

import com.ywes.application_tracker.exceptions.BadRefreshTokenException;
import com.ywes.application_tracker.dto.AuthTokenPair;
import com.ywes.application_tracker.model.RefreshToken;
import com.ywes.application_tracker.model.User;
import com.ywes.application_tracker.repository.RefreshTokenRepository;
import com.ywes.application_tracker.repository.UserRepository;
import com.ywes.application_tracker.config.RefreshTokenCookieProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class RefreshTokenService {
    @Autowired
    private RefreshTokenRepository refreshTokenRepository;
    @Autowired
    private RefreshTokenCookieProperties refreshTokenCookieProperties;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JwtService jwtService;

    @Transactional
    public AuthTokenPair applyRefreshToken(String refreshTokenString) {
        String encodedToken = hashToken(refreshTokenString);
        RefreshToken token = refreshTokenRepository.findByToken(encodedToken)
                .orElseThrow(() ->
                        new BadRefreshTokenException("Invalid refresh token")
                );
        if(isTokenExpired(token)) {
            refreshTokenRepository.delete(token);
            throw new BadRefreshTokenException("Token is expired");
        }

        User user = token.getUser();
        String jwt = jwtService.generateToken(user.getId(), user.getUsername());
        String newRefreshToken = generateRefreshToken(user.getId());
        return new AuthTokenPair(jwt, newRefreshToken);
    }

    @Transactional
    public void revokeRefreshToken(String refreshTokenString) {
        if (refreshTokenString == null || refreshTokenString.isBlank()) {
            return;
        }

        refreshTokenRepository.findByToken(hashToken(refreshTokenString)).ifPresent(token -> {
            User user = token.getUser();
            user.setRefreshToken(null);
            userRepository.save(user);
        });
    }

    @Transactional
    public String generateRefreshToken(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found: " + userId));
        RefreshToken token = refreshTokenRepository.findByUserId(userId)
                .orElseGet(RefreshToken::new);
        String tokenString = UUID.randomUUID().toString();

        token.setUser(user);
        user.setRefreshToken(token);
        token.setToken(hashToken(tokenString));
        token.setExpiryDate(Instant.now().plusMillis(refreshTokenCookieProperties.getExpirationTime()));
        refreshTokenRepository.save(token);
        return tokenString;
    }

    public boolean isTokenExpired(RefreshToken token) {
        return token.getExpiryDate().isBefore(Instant.now());
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash); // 64-char hex, stable for DB lookup
        } catch (Exception e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
