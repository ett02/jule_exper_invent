package com.example.demo.service;

import com.example.demo.model.Appointments;
import com.example.demo.model.Availability;
import com.example.demo.model.Services;
import com.example.demo.repository.AppointmentsRepository;
import com.example.demo.repository.AvailabilityRepository;
import com.example.demo.repository.ServicesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;

@Service
public class AppointmentsService {

    @Autowired
    private AppointmentsRepository appointmentsRepository;

    @Autowired
    private AvailabilityRepository availabilityRepository;

    @Autowired
    private ServicesRepository servicesRepository;

    public Appointments createAppointment(Appointments appointment) {
        Services service = servicesRepository.findById(appointment.getService().getId())
                .orElseThrow(() -> new RuntimeException("Service not found"));
        LocalTime endTime = appointment.getOrarioInizio().plusMinutes(service.getDurata());

        // Check for conflicting appointments
        List<Appointments> conflictingAppointments = appointmentsRepository.findByBarberIdAndDataAndOrarioInizioBetween(
                appointment.getBarber().getId(), appointment.getData(), appointment.getOrarioInizio(), endTime);
        if (!conflictingAppointments.isEmpty()) {
            throw new RuntimeException("The barber is not available at this time.");
        }

        // Check if the appointment is within the barber's availability
        List<Availability> availabilities = availabilityRepository.findByBarbiereId(appointment.getBarber().getId());
        boolean isAvailable = availabilities.stream().anyMatch(availability ->
                availability.getGiorno() == appointment.getData().getDayOfWeek().getValue() % 7 &&
                !appointment.getOrarioInizio().isBefore(availability.getOrario_inizio()) &&
                !endTime.isAfter(availability.getOrario_fine()));
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
