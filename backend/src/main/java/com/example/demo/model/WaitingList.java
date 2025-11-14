package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Entity
@Table(name = "waiting_list")
public class WaitingList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Users customer;

    @ManyToOne
    @JoinColumn(name = "barber_id", nullable = false)
    private Barbers barber;

    @ManyToOne
    @JoinColumn(name = "service_id", nullable = false)
    private Services service;

    private LocalDate dataRichiesta;

    private LocalDateTime dataIscrizione;

    @Enumerated(EnumType.STRING)
    private StatoListaAttesa stato;

    @Column(name = "orario_richiesto")
    private LocalTime orarioRichiesto; // Orario preferito dal cliente (opzionale)

    public enum StatoListaAttesa {
        IN_ATTESA,
        NOTIFICATO,
        CONFERMATO,
        SCADUTO,
        ANNULLATO
    }
}
