package com.ywes.application_tracker.utils;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.ywes.application_tracker.filters.RequestLoggingFilter;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RequestLoggingFilterTest {

    private final RequestLoggingFilter filter = new RequestLoggingFilter();
    private ListAppender<ILoggingEvent> listAppender;
    private Logger logger;

    @BeforeEach
    void setUp() {
        logger = (Logger) LoggerFactory.getLogger(RequestLoggingFilter.class);
        listAppender = new ListAppender<>();
        listAppender.start();
        logger.addAppender(listAppender);
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        logger.detachAppender(listAppender);
        SecurityContextHolder.clearContext();
    }

    @Test
    void logsMethodPathStatusDurationAndUserId() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/board");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = (req, res) -> {
            SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken(
                            42,
                            null,
                            AuthorityUtils.NO_AUTHORITIES
                    )
            );
            ((MockHttpServletResponse) res).setStatus(200);
        };

        filter.doFilter(request, response, chain);

        assertEquals(200, response.getStatus());
        assertEquals(1, listAppender.list.size());
        String message = listAppender.list.getFirst().getFormattedMessage();
        assertTrue(message.startsWith("GET /api/board status=200 durationMs="));
        assertTrue(message.contains(" userId=42"));
    }

    @Test
    void omitsUserIdWhenUnauthenticated() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/login");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = (req, res) -> ((MockHttpServletResponse) res).setStatus(401);

        filter.doFilter(request, response, chain);

        assertEquals(401, response.getStatus());
        assertEquals(1, listAppender.list.size());
        String message = listAppender.list.getFirst().getFormattedMessage();
        assertTrue(message.startsWith("POST /api/auth/login status=401 durationMs="));
        assertFalse(message.contains("userId="));
    }

    @Test
    void skipsErrorPath() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/error");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = (req, res) -> ((MockHttpServletResponse) res).setStatus(500);

        filter.doFilter(request, response, chain);

        assertEquals(500, response.getStatus());
        assertTrue(listAppender.list.isEmpty());
    }
}
