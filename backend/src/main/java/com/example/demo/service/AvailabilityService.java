package com.example.demo.service;

import com.example.demo.model.Availability;
import com.example.demo.model.Barbers;
import com.example.demo.repository.AvailabilityRepository;
import com.example.demo.repository.BarbersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AvailabilityService {

    @Autowired
    private AvailabilityRepository availabilityRepository;

    @Autowired
    private BarbersRepository barbersRepository;

    public Availability setAvailability(Long barberId, Availability availability) {
        Barbers barber = barbersRepository.findById(barberId).orElse(null);
        if (barber != null) {
            availability.setBarbiere(barber);
            return availabilityRepository.save(availability);
        }
        return null;
    }

    public List<Availability> getAvailability(Long barberId) {
        return availabilityRepository.findAll().stream()
                .filter(availability -> availability.getBarbiere().getId().equals(barberId))
                .toList();
    }
}
