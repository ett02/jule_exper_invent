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

    public Availability addAvailability(Long barberId, Availability availability) {
        Barbers barber = barbersRepository.findById(barberId)
                .orElseThrow(() -> new RuntimeException("Barbiere non trovato"));

        availability.setBarbiereId(barberId); // ← CORRETTO

        return availabilityRepository.save(availability);
    }

    public List<Availability> getBarberAvailability(Long barberId) {
        return availabilityRepository.findByBarbiereId(barberId);
    }

    public List<Availability> getAllAvailability() {
        return availabilityRepository.findAll();
    }
}
