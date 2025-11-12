package com.example.demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/appointments")
public class AppointmentsController {

    @PostMapping
    public void createAppointment() {
        // TODO: Implement create appointment logic
    }

    @GetMapping("/user/{user_id}")
    public void getAppointmentsByUserId(@PathVariable Long user_id) {
        // TODO: Implement get appointments by user id logic
    }

    @GetMapping("/barber/{barber_id}")
    public void getAppointmentsByBarberId(@PathVariable Long barber_id) {
        // TODO: Implement get appointments by barber id logic
    }

    @GetMapping("/{appointment_id}")
    public void getAppointmentById(@PathVariable Long appointment_id) {
        // TODO: Implement get appointment by id logic
    }
}
