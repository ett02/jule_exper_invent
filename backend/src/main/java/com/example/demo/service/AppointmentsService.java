package com.example.demo.service;

import com.example.demo.model.Appointments;
import com.example.demo.repository.AppointmentsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentsService {

    @Autowired
    private AppointmentsRepository appointmentsRepository;

    public Appointments createAppointment(Appointments appointment) {
        return appointmentsRepository.save(appointment);
    }

    public List<Appointments> getAppointmentsByUserId(Long userId) {
        return appointmentsRepository.findAll().stream()
                .filter(appointment -> appointment.getCustomer().getId().equals(userId))
                .toList();
    }

    public List<Appointments> getAppointmentsByBarberId(Long barberId) {
        return appointmentsRepository.findAll().stream()
                .filter(appointment -> appointment.getBarber().getId().equals(barberId))
                .toList();
    }

    public Appointments getAppointmentById(Long appointmentId) {
        return appointmentsRepository.findById(appointmentId).orElse(null);
    }
}
