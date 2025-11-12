package com.example.demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/services")
public class ServicesController {

    @PostMapping
    public void createService() {
        // TODO: Implement create service logic
    }

    @GetMapping
    public void getAllServices() {
        // TODO: Implement get all services logic
    }

    @GetMapping("/{id}")
    public void getServiceById(@PathVariable Long id) {
        // TODO: Implement get service by id logic
    }
}
