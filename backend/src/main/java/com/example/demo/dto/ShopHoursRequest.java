package com.example.demo.dto;

import lombok.Data;
import java.time.LocalTime;

@Data
public class ShopHoursRequest {

    private Integer giorno; // 0=Dom, 1=Lun, ..., 6=Sab
    private LocalTime orarioApertura;
    private LocalTime orarioChiusura;
    private Boolean isChiuso; // Se true, il salone è chiuso quel giorno
}
