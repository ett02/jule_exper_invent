package com.example.demo.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @PostMapping("/register")
    public void register() {
        // TODO: Implement registration logic
    }

    @PostMapping("/login")
    public void login() {
        // TODO: Implement login logic
    }

    @PostMapping("/google-login")
    public void googleLogin() {
        // TODO: Implement google login logic
    }
}
