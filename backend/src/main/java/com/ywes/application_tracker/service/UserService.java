package com.ywes.application_tracker.service;

import com.ywes.application_tracker.dto.UserMutation;
import com.ywes.application_tracker.model.User;
import com.ywes.application_tracker.repository.UserRepository;
import org.jspecify.annotations.NullMarked;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService implements UserDetailsService {
    @Autowired private UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public void registerUser(UserMutation userMutation) {
        User userEntity = User.fromUserMutation(userMutation, passwordEncoder);
        userRepository.save(userEntity);
    }

    @NullMarked
    @Override
    public User loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username).orElseThrow(() ->
                new UsernameNotFoundException("User with username " + username + " not found")
        );
    }

    public PasswordEncoder getPasswordEncoder() {
        return passwordEncoder;
    }
}
