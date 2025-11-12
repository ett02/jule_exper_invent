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
    List<Appointments> findByBarberIdAndDataAndOrarioInizio(Long barberId, LocalDate data, LocalTime orarioInizio);
    List<Appointments> findByBarberIdAndDataAndOrarioInizioBetween(Long barberId, LocalDate data, LocalTime startTime, LocalTime endTime);
}
