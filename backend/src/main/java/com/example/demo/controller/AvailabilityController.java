package com.example.demo.controller;

import com.example.demo.model.Availability;
import com.example.demo.service.AvailabilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/barbers/{id}/availability")
public class AvailabilityController {

    @Autowired
    private AvailabilityService availabilityService;

    @PostMapping
    public Availability setAvailability(@PathVariable Long id, @RequestBody Availability availability) {
        return availabilityService.setAvailability(id, availability);
    }

    @GetMapping
    public List<Availability> getAvailability(@PathVariable Long id) {
        return availabilityService.getAvailability(id);
    }
}
