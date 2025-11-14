package com.example.demo.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AppointmentResponse {
    private Long id;
    private LocalDate data;
    private LocalTime orarioInizio;
    private String stato;
    private ServiceDTO service;
    private BarberDTO barber;
}
