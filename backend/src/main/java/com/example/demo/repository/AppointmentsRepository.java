package com.example.demo.repository;

import com.example.demo.model.Appointments;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentsRepository extends JpaRepository<Appointments, Long> {
    List<Appointments> findByCustomerId(Long customerId);
    List<Appointments> findByBarberId(Long barberId);
    List<Appointments> findByBarberIdAndDataAndOrario_inizio(Long barberId, LocalDate data, LocalTime orario_inizio);
}
