package com.example.demo.controller;

import com.example.demo.model.Barbers;
import com.example.demo.model.Services;
import com.example.demo.service.BarbersService;
import com.example.demo.service.ServicesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize; // <-- AGGIUNGI IMPORT
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping; // <-- AGGIUNGI IMPORT
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
    @PreAuthorize("hasAuthority('ADMIN')") // <-- AGGIUNTO
    public Services createService(@RequestBody @NonNull Services service) {
        return servicesService.createService(service);
    }

    @GetMapping
    public List<Services> getAllServices() {
        return servicesService.getAllServices();
    }

    @GetMapping("/{id}")
    public Services getServiceById(@PathVariable @NonNull Long id) {
        return servicesService.getServiceById(id);
    }
    
    // Questo era il metodo che abbiamo aggiunto in precedenza
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')") // <-- AGGIUNTO
    public Services updateService(@PathVariable @NonNull Long id, @RequestBody @NonNull Services service) {
        return servicesService.updateService(id, service);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')") // <-- AGGIUNTO
    public void deleteService(@PathVariable @NonNull Long id) {
        servicesService.deleteService(id);
    }

    @GetMapping("/{id}/barbers")
    public List<Barbers> getBarbersByService(@PathVariable Long id) {
        return barbersService.getBarbersByService(id);
    }
}