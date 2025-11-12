package com.example.demo.controller;

import com.example.demo.model.BarberServices;
import com.example.demo.model.Barbers;
import com.example.demo.service.BarbersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/barbers")
public class BarbersController {

    @Autowired
    private BarbersService barbersService;

    @PostMapping
    public Barbers createBarber(@RequestBody Barbers barber) {
        return barbersService.createBarber(barber);
    }

    @GetMapping
    public List<Barbers> getAllBarbers() {
        return barbersService.getAllBarbers();
    }

    @GetMapping("/{id}")
    public Barbers getBarberById(@PathVariable Long id) {
        return barbersService.getBarberById(id);
    }

    @PostMapping("/{id}/services")
    public BarberServices assignServiceToBarber(@PathVariable Long id, @RequestParam Long serviceId) {
        return barbersService.assignServiceToBarber(id, serviceId);
    }

    @DeleteMapping("/{id}")
    public void deleteBarber(@PathVariable Long id) {
        barbersService.deleteBarber(id);
    }
}
