package com.ywes.application_tracker.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(RefreshTokenCookieProperties.class)
public class SecurityRefreshConfig {
}
