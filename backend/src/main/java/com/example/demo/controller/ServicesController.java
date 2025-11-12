package com.example.demo.controller;

import com.example.demo.model.Barbers;
import com.example.demo.model.Services;
import com.example.demo.service.BarbersService;
import com.example.demo.service.ServicesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/services")
public class ServicesController {

    @Autowired
    private ServicesService servicesService;

    @Autowired
    private BarbersService barbersService;

    @PostMapping
    public Services createService(@RequestBody Services service) {
        return servicesService.createService(service);
    }

    @GetMapping
    public List<Services> getAllServices() {
        return servicesService.getAllServices();
    }

    @GetMapping("/{id}")
    public Services getServiceById(@PathVariable Long id) {
        return servicesService.getServiceById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteService(@PathVariable Long id) {
        servicesService.deleteService(id);
    }

    @GetMapping("/{id}/barbers")
    public List<Barbers> getBarbersByService(@PathVariable Long id) {
        return barbersService.getBarbersByService(id);
    }
}
