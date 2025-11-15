package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalTime;

@Data
@Entity
@Table(name = "business_hours")
public class BusinessHours {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Giorno della settimana espresso come intero.
     * 0 = Domenica, 1 = Lunedì, ..., 6 = Sabato
     */
    @Column(nullable = false, unique = true)
    private Integer giorno;

    @Column(nullable = false)
    private boolean aperto;

    private LocalTime apertura;

    private LocalTime chiusura;
}
