package com.example.demo.controller;

import com.example.demo.dto.AppointmentRequest;
import com.example.demo.dto.AvailableSlotResponse;
import com.example.demo.dto.AppointmentResponse;
import com.example.demo.dto.ServiceDTO;
import com.example.demo.dto.BarberDTO;
import com.example.demo.model.Appointments;
import com.example.demo.service.AppointmentsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;

@RestController
@RequestMapping("/appointments")
public class AppointmentsController {

    @Autowired
    private AppointmentsService appointmentsService;

    @PostMapping
    public ResponseEntity<Appointments> createAppointment(@RequestBody AppointmentRequest request) {
        return ResponseEntity.ok(appointmentsService.createAppointment(request));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AppointmentResponse>> getAppointmentsByUser(@PathVariable Long userId) {
        List<Appointments> appointments = appointmentsService.getAppointmentsByUser(userId);
        List<AppointmentResponse> response = appointments.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/barber/{barberId}")
    public ResponseEntity<List<AppointmentResponse>> getAppointmentsByBarber(@PathVariable Long barberId) {
        List<Appointments> appointments = appointmentsService.getAppointmentsByBarber(barberId);
        List<AppointmentResponse> response = appointments.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Appointments> getAppointmentById(@PathVariable Long id) {
        Appointments appointment = appointmentsService.getAppointmentById(id);
        return ResponseEntity.ok(appointment);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Appointments> updateAppointment(
            @PathVariable Long id,
            @RequestBody AppointmentRequest request) {
        return ResponseEntity.ok(appointmentsService.updateAppointment(id, request));
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/{id}/status")
    public ResponseEntity<Appointments> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        if (newStatus == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(appointmentsService.updateAppointmentStatus(id, newStatus));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelAppointment(@PathVariable Long id) {
        appointmentsService.cancelAppointment(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/available-slots")
    public ResponseEntity<List<AvailableSlotResponse>> getAvailableSlots(
            @RequestParam Long barberId,
            @RequestParam Long serviceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        System.out.println("Richiesta slot per barbiere: " + barberId + ", servizio: " + serviceId + ", data: " + date);
        
        List<AvailableSlotResponse> slots = appointmentsService.getAvailableSlots(barberId, serviceId, date);
        
        System.out.println("Slot trovati: " + slots.size());
        
        return ResponseEntity.ok(slots);
    }

    @GetMapping("/by-date")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<AppointmentResponse>> getAppointmentsByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        List<Appointments> appointments = appointmentsService.getAppointmentsByDate(date);
        List<AppointmentResponse> response = appointments.stream()
            .map(this::convertToResponse) // Usiamo il metodo esistente
            .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<AppointmentResponse>> getAllAppointments() {
        List<Appointments> appointments = appointmentsService.getAllAppointments();
        List<AppointmentResponse> response = appointments.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    private AppointmentResponse convertToResponse(Appointments appointment) {
        AppointmentResponse response = new AppointmentResponse();
        response.setId(appointment.getId());
        response.setData(appointment.getData());
        response.setOrarioInizio(appointment.getOrarioInizio());
        response.setStato(appointment.getStato().toString());
        
        // Carica i dati del servizio
        if (appointment.getService() != null) {
            ServiceDTO serviceDTO = new ServiceDTO();
            serviceDTO.setId(appointment.getService().getId());
            serviceDTO.setNome(appointment.getService().getNome());
            serviceDTO.setDurata(appointment.getService().getDurata());
            serviceDTO.setPrezzo(appointment.getService().getPrezzo());
            response.setService(serviceDTO);
        }
        
        // Carica i dati del barbiere
        if (appointment.getBarber() != null) {
            BarberDTO barberDTO = new BarberDTO();
            barberDTO.setId(appointment.getBarber().getId());
            barberDTO.setNome(appointment.getBarber().getNome());
            barberDTO.setCognome(appointment.getBarber().getCognome());
            response.setBarber(barberDTO);
        }
        
        return response;
    }
}
