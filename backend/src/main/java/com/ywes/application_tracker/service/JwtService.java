package com.ywes.application_tracker.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {
    public static final String USER_ID_CLAIM = "uid";

    @Value("${security.jwt.secret-key}")
    private String secretKeyString;

    @Value("${security.jwt.expiration-time}")
    private long jwtExpiration;

    public String generateToken(Integer userId, String username) {
        return Jwts.builder()
                .subject(username)
                .claims(Map.of(USER_ID_CLAIM, userId))
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSecretKey())
                .compact();
    }

    public Integer extractUserId(String token) {
        Integer userId = extractAllClaims(token).get(USER_ID_CLAIM, Integer.class);
        if (userId == null) {
            throw new IllegalArgumentException("JWT is missing user id");
        }
        return userId;
    }

    public long getExpirationTime() {
        return jwtExpiration;
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSecretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isTokenValid(String token) {
        try {
            extractAllClaims(token);
            return true;
        } catch (Exception exception) {
            return false;
        }
    }

    private SecretKey getSecretKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKeyString);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
