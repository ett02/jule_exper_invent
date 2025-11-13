package com.example.demo.service;

import com.example.demo.model.Services;
import com.example.demo.repository.ServicesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServicesService {

    @Autowired
    private ServicesRepository servicesRepository;

    public Services createService(@NonNull Services service) {
        return servicesRepository.save(service);
    }

    public List<Services> getAllServices() {
        return servicesRepository.findAll();
    }

    public Services getServiceById(@NonNull Long id) {
        return servicesRepository.findById(id).orElse(null);
    }

    public void deleteService(@NonNull Long id) {
        servicesRepository.deleteById(id);
    }
}
