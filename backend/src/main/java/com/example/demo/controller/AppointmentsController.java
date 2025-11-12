package com.example.demo.controller;

import com.example.demo.model.Appointments;
import com.example.demo.service.AppointmentsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/appointments")
public class AppointmentsController {

    @Autowired
    private AppointmentsService appointmentsService;

    @PostMapping
    public Appointments createAppointment(@RequestBody Appointments appointment) {
        return appointmentsService.createAppointment(appointment);
    }

    @GetMapping("/user/{user_id}")
    public List<Appointments> getAppointmentsByUserId(@PathVariable Long user_id) {
        return appointmentsService.getAppointmentsByUserId(user_id);
    }

    @GetMapping("/barber/{barber_id}")
    public List<Appointments> getAppointmentsByBarberId(@PathVariable Long barber_id) {
        return appointmentsService.getAppointmentsByBarberId(barber_id);
    }

    @GetMapping("/{appointment_id}")
    public Appointments getAppointmentById(@PathVariable Long appointment_id) {
        return appointmentsService.getAppointmentById(appointment_id);
    }
}
