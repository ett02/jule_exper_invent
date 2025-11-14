package com.example.demo.repository;

import com.example.demo.model.ShopHours;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShopHoursRepository extends JpaRepository<ShopHours, Long> {

    Optional<ShopHours> findByGiorno(Integer giorno);
}
