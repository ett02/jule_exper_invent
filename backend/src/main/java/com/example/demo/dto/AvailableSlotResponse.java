package com.example.demo.dto;

import lombok.Data;
import java.time.LocalTime;

@Data
public class AvailableSlotResponse {
    private LocalTime orarioInizio;
    private Boolean disponibile;
}
