package com.example.demo.service;

import com.example.demo.dto.AppointmentRequest;
import com.example.demo.dto.AvailableSlotResponse;
import com.example.demo.model.*;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AppointmentsService {

    @Autowired
    private AppointmentsRepository appointmentsRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private BarbersRepository barbersRepository;

    @Autowired
    private ServicesRepository servicesRepository;

    @Autowired
    private AvailabilityRepository availabilityRepository;

    @Autowired
    @Lazy
    private WaitingListService waitingListService;

    private static final int SLOT_INTERVAL_MINUTES = 5;

    @Transactional
    public Appointments createAppointment(AppointmentRequest request) {
        if (!isSlotAvailable(request.getBarberId(), request.getData(), request.getOrarioInizio(), request.getServiceId())) {
            throw new RuntimeException("Slot non disponibile");
        }

        Users customer = usersRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Cliente non trovato"));
        Barbers barber = barbersRepository.findById(request.getBarberId())
                .orElseThrow(() -> new RuntimeException("Barbiere non trovato"));
        Services service = servicesRepository.findById(request.getServiceId())
                .orElseThrow(() -> new RuntimeException("Servizio non trovato"));

        Appointments appointment = new Appointments();
        appointment.setCustomer(customer);
        appointment.setBarber(barber);
        appointment.setService(service);
        appointment.setData(request.getData());
        appointment.setOrarioInizio(request.getOrarioInizio());
        appointment.setStato(Appointments.StatoAppuntamento.CONFIRMATO);

        return appointmentsRepository.save(appointment);
    }

    public List<Appointments> getAppointmentsByUser(Long userId) {
        return appointmentsRepository.findByCustomerId(userId);
    }

    public List<Appointments> getAppointmentsByBarber(Long barberId) {
        return appointmentsRepository.findByBarberId(barberId);
    }

    public Optional<Appointments> getAppointmentById(Long id) {
        return appointmentsRepository.findById(id);
    }

    public List<Appointments> getAllAppointments() {
        return appointmentsRepository.findAll();
    }

    @Transactional
    public Appointments updateAppointment(Long id, AppointmentRequest request) {
        Appointments appointment = appointmentsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appuntamento non trovato"));

        if (!isSlotAvailable(request.getBarberId(), request.getData(), request.getOrarioInizio(), request.getServiceId())) {
            throw new RuntimeException("Slot non disponibile");
        }

        Barbers barber = barbersRepository.findById(request.getBarberId())
                .orElseThrow(() -> new RuntimeException("Barbiere non trovato"));
        Services service = servicesRepository.findById(request.getServiceId())
                .orElseThrow(() -> new RuntimeException("Servizio non trovato"));

        appointment.setBarber(barber);
        appointment.setService(service);
        appointment.setData(request.getData());
        appointment.setOrarioInizio(request.getOrarioInizio());

        return appointmentsRepository.save(appointment);
    }

    @Transactional
    public void cancelAppointment(Long id) {
        Appointments appointment = appointmentsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appuntamento non trovato"));
        
        Appointments cancelledAppointment = new Appointments();
        cancelledAppointment.setBarber(appointment.getBarber());
        cancelledAppointment.setService(appointment.getService());
        cancelledAppointment.setData(appointment.getData());
        cancelledAppointment.setOrarioInizio(appointment.getOrarioInizio());
        
        appointment.setStato(Appointments.StatoAppuntamento.ANNULLATO);
        appointmentsRepository.save(appointment);

        waitingListService.processWaitingListForCancelledAppointment(cancelledAppointment);
    }

    public List<AvailableSlotResponse> getAvailableSlots(Long barberId, Long serviceId, LocalDate date) {
        List<AvailableSlotResponse> slots = new ArrayList<>();

        int dayOfWeek = date.getDayOfWeek().getValue() % 7;

        List<Availability> availabilities = availabilityRepository.findByBarberIdAndGiorno(barberId, dayOfWeek);

        if (availabilities.isEmpty()) {
            return slots;
        }

        Services service = servicesRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Servizio non trovato"));

        int serviceDuration = service.getDurata();

        for (Availability availability : availabilities) {
            LocalTime currentTime = availability.getOrarioInizio();
            LocalTime endTime = availability.getOrarioFine();

            while (currentTime.plusMinutes(serviceDuration).isBefore(endTime) ||
                   currentTime.plusMinutes(serviceDuration).equals(endTime)) {

                LocalTime slotEnd = currentTime.plusMinutes(serviceDuration);
                boolean available = isSlotAvailable(barberId, date, currentTime, serviceId);

                slots.add(new AvailableSlotResponse(currentTime, slotEnd, available));

                currentTime = currentTime.plusMinutes(SLOT_INTERVAL_MINUTES);
            }
        }

        return slots;
    }

    private boolean isSlotAvailable(Long barberId, LocalDate date, LocalTime orarioInizio, Long serviceId) {
        Services service = servicesRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Servizio non trovato"));

        LocalTime orarioFine = orarioInizio.plusMinutes(service.getDurata());

        List<Appointments> existingAppointments = appointmentsRepository
                .findByBarberIdAndDataAndStato(barberId, date, Appointments.StatoAppuntamento.CONFIRMATO);

        for (Appointments appointment : existingAppointments) {
            LocalTime existingStart = appointment.getOrarioInizio();
            LocalTime existingEnd = existingStart.plusMinutes(appointment.getService().getDurata());

            if (orarioInizio.isBefore(existingEnd) && orarioFine.isAfter(existingStart)) {
                return false;
            }
        }

        return true;
    }
}
