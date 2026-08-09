package com.ywes.application_tracker.service;

import com.ywes.application_tracker.dto.UserMutation;
import com.ywes.application_tracker.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JwtService jwtService;

    public String login(UserMutation userMutation) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(userMutation.username(), userMutation.password())
        );

        User user = (User) authentication.getPrincipal();
        return jwtService.generateToken(user.getId(), user.getUsername());
    }
}
