package com.example.demo.service;

import com.example.demo.model.Barbers;
import com.example.demo.model.BarberServices;
import com.example.demo.model.Services;
import com.example.demo.repository.BarbersRepository;
import com.example.demo.repository.BarberServicesRepository;
import com.example.demo.repository.ServicesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BarbersService {

    @Autowired
    private BarbersRepository barbersRepository;

    @Autowired
    private ServicesRepository servicesRepository;

    @Autowired
    private BarberServicesRepository barberServicesRepository;

    public Barbers createBarber(Barbers barber) {
        return barbersRepository.save(barber);
    }

    public List<Barbers> getAllBarbers() {
        return barbersRepository.findAll();
    }

    public Barbers getBarberById(Long id) {
        return barbersRepository.findById(id).orElse(null);
    }

    public BarberServices assignServiceToBarber(Long barberId, Long serviceId) {
        Barbers barber = barbersRepository.findById(barberId).orElse(null);
        Services service = servicesRepository.findById(serviceId).orElse(null);

        if (barber != null && service != null) {
            BarberServices barberService = new BarberServices();
            barberService.setBarbiere(barber);
            barberService.setServizio(service);
            return barberServicesRepository.save(barberService);
        }
        return null;
    }
}
