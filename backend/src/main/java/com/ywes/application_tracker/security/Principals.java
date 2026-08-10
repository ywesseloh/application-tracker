package com.ywes.application_tracker.security;

import org.springframework.security.core.userdetails.UserDetails;

public final class Principals {
    private Principals() {}

    /**
     * Resolves the authenticated user id from the security principal.
     * Production JWT auth uses {@link Integer}; {@code @WithMockUser(username = "<id>")}
     * uses a {@link UserDetails} whose username is the numeric user id.
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
