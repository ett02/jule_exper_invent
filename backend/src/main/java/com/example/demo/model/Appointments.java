package com.example.demo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Entity
@Table(name = "appointments")
public class Appointments {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Users customer;

    @ManyToOne
    @JoinColumn(name = "barber_id")
    private Barbers barber;

    @ManyToOne
    @JoinColumn(name = "service_id")
    private Services service;

    private LocalDate data;

    private LocalTime orarioInizio;

    @Enumerated(EnumType.STRING)
    private AppointmentStatus stato;

    public enum AppointmentStatus {
        CONFIRMATO,
        PENDING,
        ANNULLATO
    }
}
