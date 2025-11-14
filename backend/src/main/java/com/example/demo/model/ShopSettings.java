package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalTime;

@Data
@Entity
@Table(name = "shop_settings")
public class ShopSettings {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Integer giorno; // 0=Domenica, 1=Lunedì, ..., 6=Sabato
    
    @Column(name = "orario_apertura")
    private LocalTime orarioApertura; // Es: 09:00
    
    @Column(name = "orario_chiusura")
    private LocalTime orarioChiusura; // Es: 19:00
    
    @Column(name = "is_aperto")
    private Boolean isAperto; // Se false, quel giorno è chiuso
}
