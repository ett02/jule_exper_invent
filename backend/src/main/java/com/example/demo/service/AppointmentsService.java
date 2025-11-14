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
    @Lazy
    private WaitingListService waitingListService;

    public List<AvailableSlotResponse> getAvailableSlots(Long barberId, Long serviceId, LocalDate date) {
        System.out.println("====================================");
        System.out.println("GET AVAILABLE SLOTS");
        System.out.println("BarberId: " + barberId);
        System.out.println("ServiceId: " + serviceId);
        System.out.println("Date: " + date);
        System.out.println("====================================");
        
        List<AvailableSlotResponse> availableSlots = new ArrayList<>();

        // Calculate day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
        int dayOfWeek = date.getDayOfWeek().getValue() % 7;
        System.out.println("Day of week: " + dayOfWeek);

        // Get shop hours for this day
        Optional<ShopHours> shopHoursOpt = shopHoursService.getShopHoursByDay(dayOfWeek);
        
        if (shopHoursOpt.isEmpty()) {
            System.out.println("❌ NO SHOP HOURS configured for day: " + dayOfWeek);
            return availableSlots; // Empty list
        }

        ShopHours shopHours = shopHoursOpt.get();
        System.out.println("Shop Hours: " + shopHours);

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

        // Get service duration
        Services service = servicesRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        int serviceDuration = service.getDurata();
        System.out.println("Service duration: " + serviceDuration + " minutes");

        // Generate slots based on SERVICE DURATION (not every 5 minutes)
        LocalTime slotTime = shopOpenTime;
        int slotCount = 0;
        
        while (slotTime.plusMinutes(serviceDuration).compareTo(shopCloseTime) <= 0) {
            boolean isAvailable = isBarberAvailable(barberId, date, slotTime, slotTime.plusMinutes(serviceDuration));
            
            availableSlots.add(new AvailableSlotResponse(slotTime, isAvailable));
            slotCount++;
            
            // Increment by service duration
            slotTime = slotTime.plusMinutes(serviceDuration);
        }

        System.out.println("====================================");
        System.out.println("✅ TOTAL SLOTS GENERATED: " + slotCount);
        if (slotCount > 0) {
            System.out.println("First slot: " + availableSlots.get(0).getOrario());
            System.out.println("Last slot: " + availableSlots.get(slotCount - 1).getOrario());
            
            long available = availableSlots.stream().filter(AvailableSlotResponse::isDisponibile).count();
            long occupied = slotCount - available;
            System.out.println("Available: " + available + ", Occupied: " + occupied);
        }
        System.out.println("====================================");

        return availableSlots;
    }

    private boolean isBarberAvailable(Long barberId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        System.out.println("=== CHECK BARBER AVAILABILITY ===");
        System.out.println("BarberId: " + barberId + ", Date: " + date);
        System.out.println("Checking slot: " + startTime + " - " + endTime);
        
        List<Appointments> existingAppointments = appointmentsRepository.findByBarberIdAndData(barberId, date);
        System.out.println("Existing appointments for this barber/date: " + existingAppointments.size());

        if (existingAppointments.isEmpty()) {
            System.out.println("✅ No existing appointments - Slot AVAILABLE");
            return true;
        }

        for (Appointments appointment : existingAppointments) {
            // Skip cancelled appointments
            if (appointment.getStato() == Appointments.StatoAppuntamento.ANNULLATO) {
                System.out.println("Skipping cancelled appointment: " + appointment.getId());
                continue;
            }

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

        System.out.println("✅ No overlaps - Slot AVAILABLE");
        return true; // Slot available
    }

    public Appointments createAppointment(AppointmentRequest request) {
        System.out.println("=== CREATE APPOINTMENT ===");
        System.out.println("Request: " + request);

        // Verifica disponibilità slot
        Services service = servicesRepository.findById(request.getServiceId())
                .orElseThrow(() -> new RuntimeException("Servizio non trovato"));
        
        if (!isBarberAvailable(request.getBarberId(), request.getData(), request.getOrarioInizio(), 
                request.getOrarioInizio().plusMinutes(service.getDurata()))) {
            throw new RuntimeException("Slot non disponibile");
        }

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

    public Appointments updateAppointment(Long id, AppointmentRequest request) {
        Appointments appointment = getAppointmentById(id);
        
        // Aggiorna i campi
        appointment.setData(request.getData());
        appointment.setOrarioInizio(request.getOrarioInizio());
        
        // Aggiorna barbiere se cambiato
        if (request.getBarberId() != null) {
            com.example.demo.model.Barbers barber = new com.example.demo.model.Barbers();
            barber.setId(request.getBarberId());
            appointment.setBarber(barber);
        }
        
        // Aggiorna servizio se cambiato
        if (request.getServiceId() != null) {
            Services service = new Services();
            service.setId(request.getServiceId());
            appointment.setService(service);
        }
        
        return appointmentsRepository.save(appointment);
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

    public List<Appointments> getAppointmentsByDate(LocalDate date) {
        return appointmentsRepository.findByDataOrderByOrarioInizioAsc(date);
    }

    public List<Appointments> getAllAppointments() {
        return appointmentsRepository.findAll();
    }
}
