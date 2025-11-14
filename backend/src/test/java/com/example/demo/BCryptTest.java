package com.example.demo;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class BCryptTest {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        String password = "admin123";
        String hashFromDB = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCu";
        
        boolean matches = encoder.matches(password, hashFromDB);
        
        System.out.println("Password: " + password);
        System.out.println("Hash DB: " + hashFromDB);
        System.out.println("Match: " + matches);
        
        if (!matches) {
            System.out.println("\n❌ La password NON corrisponde! Genera nuovo hash:");
            String newHash = encoder.encode(password);
            System.out.println("Nuovo hash: " + newHash);
        }
    }
}
