package com.example.demo.dto;

import lombok.Data;

@Data
public class ServiceDTO {
    private Long id;
    private String nome;
    private Integer durata;
    private Float prezzo;
}
