package com.example.demo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import java.time.LocalTime;

@Data
@Entity
@Table(name = "availability")
public class Availability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "barbiere_id")
    private Long barbiereId;  // Deve chiamarsi così

    private Integer giorno; // 0=Domenica, 1=Lunedì, ..., 6=Sabato

    private LocalTime orarioInizio;

    private LocalTime orarioFine;
}
