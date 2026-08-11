package com.ywes.application_tracker.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Setter
@Getter
@ConfigurationProperties(prefix = "security.refresh")
public class RefreshTokenCookieProperties {
    private String cookieName = "refresh_token";
    private String cookiePath = "/api/auth";
    private boolean cookieSecure = false;
    private String cookieSameSite = "None";
    private long expirationTime;
}
