package com.ywes.application_tracker.service;

import com.ywes.application_tracker.common.BadRefreshTokenException;
import com.ywes.application_tracker.dto.LoginResponse;
import com.ywes.application_tracker.model.RefreshToken;
import com.ywes.application_tracker.model.User;
import com.ywes.application_tracker.repository.RefreshTokenRepository;
import com.ywes.application_tracker.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;

@Service
public class RefreshTokenService {
    @Value("${security.refresh.expiration-time}")
    private Long refreshTokenDurationMs;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JwtService jwtService;

    @Transactional
    public LoginResponse applyRefreshToken(String refreshTokenString) {
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
        return new LoginResponse(jwt, newRefreshToken);
    }

    @Transactional
    public String generateRefreshToken(Integer userId) {
        RefreshToken token = refreshTokenRepository.findByUserId(userId)
                .orElseGet(RefreshToken::new);
        String tokenString = UUID.randomUUID().toString();

        token.setUser(userRepository.getReferenceById(userId));
        token.setToken(hashToken(tokenString));
        token.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs));
        refreshTokenRepository.save(token);
        return tokenString;
    }

    public void deleteRefreshToken(Integer userId) {
        refreshTokenRepository.findByUserId(userId).ifPresent((token) -> {
            refreshTokenRepository.delete(token);
        });
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
