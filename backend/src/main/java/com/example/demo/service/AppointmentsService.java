package com.example.demo.service;

import com.example.demo.dto.AppointmentRequest;
import com.example.demo.dto.AvailableSlotResponse;
import com.example.demo.model.Appointments;
import com.example.demo.model.Services;
import com.example.demo.model.ShopHours;
import com.example.demo.repository.AppointmentsRepository;
import com.example.demo.repository.ServicesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

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
    private ServicesRepository servicesRepository;

    @Autowired
    private ShopHoursService shopHoursService;

    @Autowired
    private WaitingListRepository waitingListRepository;

        // Calculate day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
        int dayOfWeek = date.getDayOfWeek().getValue() % 7;
        System.out.println("Day of week: " + dayOfWeek);

    /**
     * Creates a new appointment.
     *
     * @param request the appointment request
     * @return the created appointment
     */
    @Transactional
    public Appointments createAppointment(AppointmentRequest request) {
        if (!isSlotAvailable(request.getBarberId(), request.getData(), request.getOrarioInizio(), request.getServiceId())) {
            throw new RuntimeException("Slot non disponibile");
        }

        Users customer = getEntityById(usersRepository, request.getCustomerId(), "Cliente non trovato");
        Barbers barber = getEntityById(barbersRepository, request.getBarberId(), "Barbiere non trovato");
        Services service = getEntityById(servicesRepository, request.getServiceId(), "Servizio non trovato");

        if (shopHours.getIsChiuso() == null || shopHours.getIsChiuso()) {
            System.out.println("❌ SHOP CLOSED on day: " + dayOfWeek);
            return availableSlots; // Empty list
        }

        LocalTime shopOpenTime = shopHours.getOrarioApertura();
        LocalTime shopCloseTime = shopHours.getOrarioChiusura();
        
        if (shopOpenTime == null || shopCloseTime == null) {
            System.out.println("❌ INVALID SHOP HOURS (null opening/closing time)");
            return availableSlots;
        }
        
        System.out.println("✅ Shop Hours - Open: " + shopOpenTime + ", Close: " + shopCloseTime);

    private <T, ID> T getEntityById(JpaRepository<T, ID> repository, ID id, String errorMessage) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException(errorMessage));
    }

    private <T, ID> T getEntityById(JpaRepository<T, ID> repository, ID id, String errorMessage) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException(errorMessage));
    }

    /**
     * Gets all appointments for a user.
     *
     * @param userId the user id
     * @return the list of appointments
     */
    public List<Appointments> getAppointmentsByUser(Long userId) {
        return appointmentsRepository.findByCustomerId(userId);
    }

    /**
     * Gets all appointments for a barber.
     *
     * @param barberId the barber id
     * @return the list of appointments
     */
    public List<Appointments> getAppointmentsByBarber(Long barberId) {
        return appointmentsRepository.findByBarberId(barberId);
    }

    /**
     * Gets an appointment by id.
     *
     * @param id the appointment id
     * @return the appointment
     */
    public Optional<Appointments> getAppointmentById(Long id) {
        return appointmentsRepository.findById(id);
    }

    /**
     * Gets all appointments.
     *
     * @return the list of appointments
     */
    public List<Appointments> getAllAppointments() {
        return appointmentsRepository.findAll();
    }

    /**
     * Updates an appointment.
     *
     * @param id      the appointment id
     * @param request the appointment request
     * @return the updated appointment
     */
    @Transactional
    public Appointments updateAppointment(Long id, AppointmentRequest request) {
        Appointments appointment = getEntityById(appointmentsRepository, id, "Appuntamento non trovato");

        if (existingAppointments.isEmpty()) {
            System.out.println("✅ No existing appointments - Slot AVAILABLE");
            return true;
        }

        Barbers barber = getEntityById(barbersRepository, request.getBarberId(), "Barbiere non trovato");
        Services service = getEntityById(servicesRepository, request.getServiceId(), "Servizio non trovato");

            LocalTime existingStart = appointment.getOrarioInizio();
            
            // Calculate end time of existing appointment
            Services existingService = servicesRepository.findById(appointment.getService().getId())
                    .orElseThrow(() -> new RuntimeException("Service not found"));
            LocalTime existingEnd = existingStart.plusMinutes(existingService.getDurata());

            System.out.println("Existing appointment: " + existingStart + " - " + existingEnd);

            // Check for overlap
            boolean overlaps = startTime.isBefore(existingEnd) && endTime.isAfter(existingStart);
            
            if (overlaps) {
                System.out.println("❌ Overlap detected - Slot OCCUPIED");
                return false; // Slot occupied
            }
        }

        Barbers barber = getEntityById(barbersRepository, request.getBarberId(), "Barbiere non trovato");
        Services service = getEntityById(servicesRepository, request.getServiceId(), "Servizio non trovato");

        Appointments appointment = new Appointments();
        appointment.setCustomer(new com.example.demo.model.Users());
        appointment.getCustomer().setId(request.getCustomerId());
        
        appointment.setBarber(new com.example.demo.model.Barbers());
        appointment.getBarber().setId(request.getBarberId());
        
        appointment.setService(service);
        
        appointment.setData(request.getData());
        appointment.setOrarioInizio(request.getOrarioInizio());
        appointment.setStato(Appointments.StatoAppuntamento.CONFIRMATO);

        Appointments saved = appointmentsRepository.save(appointment);
        System.out.println("✅ Appuntamento creato: " + saved.getId());
        
        return saved;
    }

    /**
     * Cancels an appointment.
     *
     * @param id the appointment id
     */
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

    /**
     * Gets the available slots for a barber, service, and date.
     *
     * @param barberId  the barber id
     * @param serviceId the service id
     * @param date      the date
     * @return the list of available slots
     */
    public List<AvailableSlotResponse> getAvailableSlots(Long barberId, Long serviceId, LocalDate date) {
        List<AvailableSlotResponse> slots = new ArrayList<>();

        int dayOfWeek = date.getDayOfWeek().getValue() % 7;

        List<Availability> availabilities = availabilityRepository.findByBarberIdAndGiorno(barberId, dayOfWeek);

        if (availabilities.isEmpty()) {
            return slots;
        }
    }

    public Appointments updateAppointmentStatus(Long id, String newStatus) {
        Appointments appointment = getAppointmentById(id);
        
        // Converte la stringa nello stato Enum corretto
        try {
            Appointments.StatoAppuntamento statoEnum = Appointments.StatoAppuntamento.valueOf(newStatus.toUpperCase());
            appointment.setStato(statoEnum);
            return appointmentsRepository.save(appointment);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Stato non valido: " + newStatus);
        }
    }

    public List<Appointments> getAppointmentsByUser(Long userId) {
        return appointmentsRepository.findByCustomerId(userId);
    }

    public List<Appointments> getAppointmentsByBarber(Long barberId) {
        return appointmentsRepository.findByBarberId(barberId);
    }

    public Appointments getAppointmentById(Long id) {
        return appointmentsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appuntamento non trovato"));
    }

    public void cancelAppointment(Long id) {
        Appointments appointment = getAppointmentById(id);
        appointment.setStato(Appointments.StatoAppuntamento.ANNULLATO);
        appointmentsRepository.save(appointment);

        // Processa lista d'attesa
        if (waitingListService != null) {
            waitingListService.processWaitingListForCancelledAppointment(
                appointment.getBarber().getId(),
                appointment.getService().getId(),
                appointment.getData()
            );
        }
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
