package com.example.demo.controller;

import com.example.demo.model.Availability;
import com.example.demo.service.AvailabilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/availability")
public class AvailabilityController {

    @Autowired
    private AvailabilityService availabilityService;

    @PostMapping("/barber/{barberId}")
    public ResponseEntity<Availability> createAvailability(@PathVariable Long barberId, @RequestBody Availability availability) {
        return ResponseEntity.ok(availabilityService.addAvailability(barberId, availability));
    }

    @GetMapping
    public ResponseEntity<List<Availability>> getAllAvailability() {
        return ResponseEntity.ok(availabilityService.getAllAvailability());
    }

    @GetMapping("/barber/{barberId}")
    public ResponseEntity<List<Availability>> getAvailabilityByBarber(@PathVariable Long barberId) {
        return ResponseEntity.ok(availabilityService.getBarberAvailability(barberId)); // ← CORRETTO
    }
}
