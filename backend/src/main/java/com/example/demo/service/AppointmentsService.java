package com.example.demo.service;

import com.example.demo.model.Appointments;
import com.example.demo.repository.AppointmentsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.lang.NonNull;

import java.util.List;

@Service
public class AppointmentsService {

    @Autowired
    private AppointmentsRepository appointmentsRepository;

    public Appointments createAppointment(@NonNull Appointments appointment) {
        return appointmentsRepository.save(appointment);
    }

    public List<Appointments> getAppointmentsByUserId(Long userId) {
        return appointmentsRepository.findByCustomerId(userId);
    }

    public List<Appointments> getAppointmentsByBarberId(Long barberId) {
        return appointmentsRepository.findByBarberId(barberId);
    }

    public Appointments getAppointmentById(@NonNull Long appointmentId) {
        return appointmentsRepository.findById(appointmentId).orElse(null);
    }
}
