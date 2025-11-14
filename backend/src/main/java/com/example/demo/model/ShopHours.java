package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalTime;

@Data
@Entity
@Table(name = "shop_hours")
public class ShopHours {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer giorno; // 0=Domenica, 1=Lunedì, ..., 6=Sabato

    @Column(name = "orario_apertura")
    private LocalTime orarioApertura;

    @Column(name = "orario_chiusura")
    private LocalTime orarioChiusura;

    private Boolean isChiuso; // true se il salone è chiuso quel giorno

    // Costruttore vuoto richiesto da JPA
    public ShopHours() {}

    // Costruttore con parametri
    public ShopHours(Integer giorno, LocalTime orarioApertura, LocalTime orarioChiusura, Boolean isChiuso) {
        this.giorno = giorno;
        this.orarioApertura = orarioApertura;
        this.orarioChiusura = orarioChiusura;
        this.isChiuso = isChiuso;
    }
}
