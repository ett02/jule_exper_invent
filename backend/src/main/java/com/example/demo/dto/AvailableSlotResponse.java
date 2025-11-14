package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvailableSlotResponse {
    private LocalTime orario;
    private boolean disponibile; // true = slot DISPONIBILE, false = slot OCCUPATO
}
