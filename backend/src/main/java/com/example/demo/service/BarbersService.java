package com.example.demo.service;

import com.example.demo.dto.BarberAvailabilityRequest;
import com.example.demo.model.Availability;
import com.example.demo.model.BarberServices;
import com.example.demo.model.Barbers;
import com.example.demo.model.Services;
import com.example.demo.repository.AvailabilityRepository;
import com.example.demo.repository.BarberServicesRepository;
import com.example.demo.repository.BarbersRepository;
import com.example.demo.repository.ServicesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BarbersService {

    @Autowired
    private BarbersRepository barbersRepository;

    @Autowired
    private ServicesRepository servicesRepository;

    @Autowired
    private BarberServicesRepository barberServicesRepository;

    @Autowired
    private AvailabilityRepository availabilityRepository;

    public List<Barbers> getAllBarbers() {
        return barbersRepository.findAll();
    }

    public Optional<Barbers> getBarberById(Long id) {
        return barbersRepository.findById(id);
    }

    public Barbers createBarber(Barbers barber) {
        barber.setIsActive(true);
        return barbersRepository.save(barber);
    }

    public Barbers updateBarber(Long id, Barbers barberDetails) {
        Barbers barber = barbersRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Barber not found"));
        
        barber.setNome(barberDetails.getNome());
        barber.setCognome(barberDetails.getCognome());
        barber.setEsperienza(barberDetails.getEsperienza());
        barber.setSpecialità(barberDetails.getSpecialità());
        barber.setIsActive(barberDetails.getIsActive());
        
        return barbersRepository.save(barber);
    }

    public void deleteBarber(Long id) {
        barbersRepository.deleteById(id);
    }

    public BarberServices assignServiceToBarber(Long barberId, Long serviceId) {
        Barbers barber = barbersRepository.findById(barberId)
                .orElseThrow(() -> new RuntimeException("Barber not found"));
        Services service = servicesRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        BarberServices barberService = new BarberServices();
        barberService.setBarber(barber);
        barberService.setService(service);
        
        return barberServicesRepository.save(barberService);
    }

    public List<BarberServices> getBarberServices(Long barberId) {
        return barberServicesRepository.findByBarberId(barberId);
    }

    public Availability addAvailability(Long barberId, BarberAvailabilityRequest request) {
        Barbers barber = barbersRepository.findById(barberId)
                .orElseThrow(() -> new RuntimeException("Barber not found"));

        Availability availability = new Availability();
        availability.setBarber(barber);
        availability.setGiorno(request.getGiorno());
        availability.setOrarioInizio(request.getOrarioInizio());
        availability.setOrarioFine(request.getOrarioFine());
        
        return availabilityRepository.save(availability);
    }

    public List<Availability> getBarberAvailability(Long barberId) {
        return availabilityRepository.findByBarberId(barberId);
    }

    public List<Barbers> getBarbersByService(Long serviceId) {
        List<BarberServices> barberServices = barberServicesRepository.findByServiceId(serviceId);
        return barberServices.stream()
                .map(BarberServices::getBarber)
                .filter(Barbers::getIsActive)
                .collect(Collectors.toList());
    }
}
