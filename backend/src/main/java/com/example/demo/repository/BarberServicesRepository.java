package com.example.demo.repository;

import com.example.demo.model.BarberServices;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BarberServicesRepository extends JpaRepository<BarberServices, Long> {
}
