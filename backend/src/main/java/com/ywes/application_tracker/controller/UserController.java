package com.ywes.application_tracker.controller;

import com.ywes.application_tracker.dto.UserMutation;
import com.ywes.application_tracker.service.AuthService;
import com.ywes.application_tracker.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public void registerUser(@Valid @RequestBody UserMutation userMutation) {
        userService.registerUser(userMutation);
    }
}
