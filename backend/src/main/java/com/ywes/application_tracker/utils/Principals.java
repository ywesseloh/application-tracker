package com.ywes.application_tracker.utils;

import org.springframework.security.core.userdetails.UserDetails;

public final class Principals {
    private Principals() {}

    /**
     * Resolves the authenticated user id from the security principal.
     * Production JWT auth uses Integer
     * Test @WithMockUser uses UserDetails with String username.
     */
    public static Integer resolve(Object principal) {
        return switch (principal) {
            case Integer id -> id;
            case UserDetails details -> Integer.valueOf(details.getUsername());
            case null -> null;
            default -> throw new IllegalStateException(
                    "Unsupported authentication principal type: " + principal.getClass().getName()
            );
        };
    }
}
