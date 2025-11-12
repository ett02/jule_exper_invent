package com.example.demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/barbers/{id}/availability")
public class AvailabilityController {

    @PostMapping
    public void setAvailability(@PathVariable Long id) {
        // TODO: Implement set availability logic
    }

    @GetMapping
    public void getAvailability(@PathVariable Long id) {
        // TODO: Implement get availability logic
    }
}
