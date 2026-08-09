package com.ywes.application_tracker.security;

import org.springframework.security.core.AuthenticatedPrincipal;

public record AuthUser(Integer id, String username) implements AuthenticatedPrincipal {
    @Override
    public String getName() {
        return username;
    }
}
