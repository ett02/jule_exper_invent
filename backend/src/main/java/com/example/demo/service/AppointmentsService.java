package com.example.demo.service;

import com.example.demo.dto.AppointmentRequest;
import com.example.demo.dto.AvailableSlotResponse;
import com.example.demo.model.*;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.jpa.repository.JpaRepository;
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
    private WaitingListRepository waitingListRepository;

    private static final int SLOT_INTERVAL_MINUTES = 5;

    @Transactional
    public Appointments createAppointment(AppointmentRequest request) {
        if (!isSlotAvailable(request.getBarberId(), request.getData(), request.getOrarioInizio(), request.getServiceId())) {
            throw new RuntimeException("Slot non disponibile");
        }

        Users customer = getEntityById(usersRepository, request.getCustomerId(), "Cliente non trovato");
        Barbers barber = getEntityById(barbersRepository, request.getBarberId(), "Barbiere non trovato");
        Services service = getEntityById(servicesRepository, request.getServiceId(), "Servizio non trovato");

        Appointments appointment = new Appointments();
        appointment.setCustomer(customer);
        appointment.setBarber(barber);
        appointment.setService(service);
        appointment.setData(request.getData());
        appointment.setOrarioInizio(request.getOrarioInizio());
        appointment.setStato(Appointments.StatoAppuntamento.CONFIRMATO);

        return appointmentsRepository.save(appointment);
    }

    private <T, ID> T getEntityById(JpaRepository<T, ID> repository, ID id, String errorMessage) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException(errorMessage));
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
        Appointments appointment = getEntityById(appointmentsRepository, id, "Appuntamento non trovato");

        if (!isSlotAvailable(request.getBarberId(), request.getData(), request.getOrarioInizio(), request.getServiceId())) {
            throw new RuntimeException("Slot non disponibile");
        }

        Barbers barber = getEntityById(barbersRepository, request.getBarberId(), "Barbiere non trovato");
        Services service = getEntityById(servicesRepository, request.getServiceId(), "Servizio non trovato");

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

        appointment.setStato(Appointments.StatoAppuntamento.ANNULLATO);
        appointmentsRepository.save(appointment);

        processWaitingListForCancelledAppointment(appointment);
    }

    private void processWaitingListForCancelledAppointment(Appointments cancelledAppointment) {
        // Find the first in the waiting list for that barber, service, and date
        Optional<WaitingList> firstInQueue = waitingListRepository
                .findFirstByBarberIdAndServiceIdAndDataRichiestaAndStatoOrderByDataIscrizioneAsc(
                        cancelledAppointment.getBarber().getId(),
                        cancelledAppointment.getService().getId(),
                        cancelledAppointment.getData(),
                        WaitingList.StatoListaAttesa.IN_ATTESA
                );

        if (firstInQueue.isPresent()) {
            WaitingList waitingEntry = firstInQueue.get();

            // Automatically create the appointment for the first in the queue
            AppointmentRequest appointmentRequest = new AppointmentRequest();
            appointmentRequest.setCustomerId(waitingEntry.getCustomer().getId());
            appointmentRequest.setBarberId(waitingEntry.getBarber().getId());
            appointmentRequest.setServiceId(waitingEntry.getService().getId());
            appointmentRequest.setData(cancelledAppointment.getData());
            appointmentRequest.setOrarioInizio(cancelledAppointment.getOrarioInizio());

            try {
                createAppointment(appointmentRequest);

                // Update the status in the waiting list
                waitingEntry.setStato(WaitingList.StatoListaAttesa.CONFERMATO);
                waitingListRepository.save(waitingEntry);

            } catch (Exception e) {
                System.err.println("Error in the automatic assignment of the slot: " + e.getMessage());
            }
        }
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

        return existingAppointments.stream().noneMatch(appointment -> {
            LocalTime existingStart = appointment.getOrarioInizio();
            LocalTime existingEnd = existingStart.plusMinutes(appointment.getService().getDurata());
            return orarioInizio.isBefore(existingEnd) && orarioFine.isAfter(existingStart);
        });
    }
}
