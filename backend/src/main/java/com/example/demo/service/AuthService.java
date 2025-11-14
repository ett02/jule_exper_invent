package com.example.demo.service;

import com.example.demo.model.Users;
import com.example.demo.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Users register(Users user) {
        // IMPORTANTE: Hasha la password con BCrypt prima di salvare
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setData_creazione(LocalDateTime.now());
        return usersRepository.save(user);
    }
}
