package com.example.demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/barbers")
public class BarbersController {

    @PostMapping
    public void createBarber() {
        // TODO: Implement create barber logic
    }

    @GetMapping
    public void getAllBarbers() {
        // TODO: Implement get all barbers logic
    }

    @GetMapping("/{id}")
    public void getBarberById(@PathVariable Long id) {
        // TODO: Implement get barber by id logic
    }

    @PostMapping("/{id}/services")
    public void assignServiceToBarber(@PathVariable Long id) {
        // TODO: Implement assign service to barber logic
    }
}
