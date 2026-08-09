package com.ywes.application_tracker.service;

import com.ywes.application_tracker.dto.UserMutation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JwtService jwtService;

    public String login (UserMutation userMutation) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(userMutation.username(), userMutation.password())
        );

        return jwtService.generateToken(userMutation.username());
    }
}
