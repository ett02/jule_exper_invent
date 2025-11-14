package com.example.demo.service;

import com.example.demo.model.ShopHours;
import com.example.demo.repository.ShopHoursRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
public class ShopHoursService {

    @Autowired
    private ShopHoursRepository shopHoursRepository;

    // Ottieni tutti gli orari di apertura
    public List<ShopHours> getAllShopHours() {
        return shopHoursRepository.findAll();
    }

    // Ottieni orari per un giorno specifico
    public Optional<ShopHours> getShopHoursByDay(Integer giorno) {
        return shopHoursRepository.findByGiorno(giorno);
    }

    // Configura orari per un giorno (crea o aggiorna)
    public ShopHours setShopHours(Integer giorno, LocalTime orarioApertura, LocalTime orarioChiusura, Boolean isChiuso) {
        Optional<ShopHours> existingHours = shopHoursRepository.findByGiorno(giorno);

        ShopHours shopHours;
        if (existingHours.isPresent()) {
            // Aggiorna esistente
            shopHours = existingHours.get();
            shopHours.setOrarioApertura(orarioApertura);
            shopHours.setOrarioChiusura(orarioChiusura);
            shopHours.setIsChiuso(isChiuso);
        } else {
            // Crea nuovo
            shopHours = new ShopHours(giorno, orarioApertura, orarioChiusura, isChiuso);
        }

        return shopHoursRepository.save(shopHours);
    }

    // Elimina orari per un giorno
    public void deleteShopHoursByDay(Integer giorno) {
        shopHoursRepository.findByGiorno(giorno).ifPresent(shopHoursRepository::delete);
    }

    // Verifica se il salone è aperto in un determinato giorno e orario
    public boolean isShopOpen(Integer giorno, LocalTime orario) {
        Optional<ShopHours> shopHours = shopHoursRepository.findByGiorno(giorno);

        if (shopHours.isEmpty() || shopHours.get().getIsChiuso()) {
            return false; // Salone chiuso quel giorno
        }

        ShopHours hours = shopHours.get();
        return !orario.isBefore(hours.getOrarioApertura()) && !orario.isAfter(hours.getOrarioChiusura());
    }
}
