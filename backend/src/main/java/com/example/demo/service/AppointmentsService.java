package com.example.demo.service;

import com.example.demo.model.Appointments;
import com.example.demo.model.Availability;
import com.example.demo.repository.AppointmentsRepository;
import com.example.demo.repository.AvailabilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentsService {

    @Autowired
    private AppointmentsRepository appointmentsRepository;

    @Autowired
    private AvailabilityRepository availabilityRepository;

    public Appointments createAppointment(Appointments appointment) {
        // Check for conflicting appointments
        List<Appointments> conflictingAppointments = appointmentsRepository.findByBarberIdAndDataAndOrario_inizio(
                appointment.getBarber().getId(), appointment.getData(), appointment.getOrario_inizio());
        if (!conflictingAppointments.isEmpty()) {
            throw new RuntimeException("The barber is not available at this time.");
        }

        // Check if the appointment is within the barber's availability
        List<Availability> availabilities = availabilityRepository.findByBarbiereId(appointment.getBarber().getId());
        boolean isAvailable = availabilities.stream().anyMatch(availability ->
                availability.getGiorno() == appointment.getData().getDayOfWeek().getValue() &&
                !appointment.getOrario_inizio().isBefore(availability.getOrario_inizio()) &&
                !appointment.getOrario_inizio().isAfter(availability.getOrario_fine()));
        if (!isAvailable) {
            throw new RuntimeException("The barber is not available at this time.");
        }

        return appointmentsRepository.save(appointment);
    }

    public List<Appointments> getAppointmentsByUserId(Long userId) {
        return appointmentsRepository.findByCustomerId(userId);
    }

    public List<Appointments> getAppointmentsByBarberId(Long barberId) {
        return appointmentsRepository.findByBarberId(barberId);
    }

    public Appointments getAppointmentById(Long appointmentId) {
        return appointmentsRepository.findById(appointmentId).orElse(null);
    }
}
