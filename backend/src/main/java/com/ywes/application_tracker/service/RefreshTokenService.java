package com.ywes.application_tracker.service;

import com.ywes.application_tracker.common.BadRefreshTokenException;
import com.ywes.application_tracker.model.RefreshToken;
import com.ywes.application_tracker.model.User;
import com.ywes.application_tracker.repository.RefreshTokenRepository;
import com.ywes.application_tracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.Instant;
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

    public String getOrCreateRefreshToken(Integer userId) {
        return refreshTokenRepository.findByUserId(userId)
                .map(RefreshToken::getToken)
                .orElse(createRefreshToken(userId));
    }

    private String createRefreshToken(Integer userId) {
        var token = new RefreshToken();
        token.setUser(userRepository.getReferenceById(userId));
        token.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs));
        token.setToken(UUID.randomUUID().toString());
        return refreshTokenRepository.save(token).getToken();
    }

    public String applyRefreshToken(String refreshTokenString) {
        RefreshToken token = refreshTokenRepository.findByToken(refreshTokenString)
                .orElseThrow(() ->
                    new BadRefreshTokenException("Invalid refresh token")
                );
        if(isTokenExpired(token)) {
            refreshTokenRepository.delete(token);
            throw new BadRefreshTokenException("Token is expired");
        }

        User user = token.getUser();
        return jwtService.generateToken(user.getId(), user.getUsername());
    }

    public void deleteRefreshToken(Integer userId) {
        refreshTokenRepository.findByUserId(userId).ifPresent((token) -> {
            refreshTokenRepository.delete(token);
        });
    }

    public boolean isTokenExpired(RefreshToken token) {
        return token.getExpiryDate().isBefore(Instant.now());
    }
}
