package com.example.demo.service;

import com.example.demo.dto.AppointmentRequest;
import com.example.demo.dto.AvailableSlotResponse;
import com.example.demo.model.*;
import com.example.demo.repository.*;
import com.example.demo.exception.ResourceNotFoundException;
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

    @Autowired
    private ShopHoursService shopHoursService;

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
        List<AvailableSlotResponse> availableSlots = new ArrayList<>();

        // Ottieni giorno della settimana (0=Dom, 1=Lun, ..., 6=Sab)
        int dayOfWeek = date.getDayOfWeek().getValue() % 7; // 0=Dom, 1=Lun, ..., 6=Sab

        // Verifica orari apertura salone
        if (!shopHoursService.getShopHoursByDay(dayOfWeek).isPresent()) {
            return availableSlots; // Nessun orario configurato, ritorna lista vuota
        }

        ShopHours shopHours = shopHoursService.getShopHoursByDay(dayOfWeek).get();

        if (shopHours.getIsChiuso()) {
            return availableSlots; // Salone chiuso quel giorno
        }

        // Usa orari salone invece di orari barbiere
        LocalTime shopOpenTime = shopHours.getOrarioApertura();
        LocalTime shopCloseTime = shopHours.getOrarioChiusura();

        // Ottieni la durata del servizio
        Services service = servicesRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Servizio non trovato con ID: " + serviceId));
        int serviceDuration = service.getDurata();

        // Genera slot disponibili ogni 5 minuti nell'intervallo di apertura
        LocalTime slotTime = shopOpenTime;
        while (slotTime.plusMinutes(serviceDuration).compareTo(shopCloseTime) <= 0) {
            // Verifica se barbiere è disponibile a quest'orario
            if (!isBarberAvailable(barberId, date, slotTime, slotTime.plusMinutes(serviceDuration))) {
                availableSlots.add(new AvailableSlotResponse(slotTime, false));
            } else {
                availableSlots.add(new AvailableSlotResponse(slotTime, true));
            }

            slotTime = slotTime.plusMinutes(5);
        }

        return availableSlots;
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

    private boolean isBarberAvailable(Long barberId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        List<Appointments> appointments = appointmentsRepository
                .findByBarberIdAndDataAndStato(barberId, date, Appointments.StatoAppuntamento.CONFIRMATO);

        for (Appointments appointment : appointments) {
            LocalTime appointmentStart = appointment.getOrarioInizio();
            LocalTime appointmentEnd = appointmentStart.plusMinutes(appointment.getService().getDurata());

            // Controlla sovrapposizione
            if (startTime.isBefore(appointmentEnd) && endTime.isAfter(appointmentStart)) {
                return false;
            }
        }

        return true;
    }
}
