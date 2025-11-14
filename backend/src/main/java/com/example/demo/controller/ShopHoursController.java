package com.example.demo.controller;

import com.example.demo.dto.ShopHoursRequest;
import com.example.demo.model.ShopHours;
import com.example.demo.service.ShopHoursService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/shop-hours")
public class ShopHoursController {

    @Autowired
    private ShopHoursService shopHoursService;

    // GET /shop-hours - Ottieni tutti gli orari di apertura
    @GetMapping
    public List<ShopHours> getAllShopHours() {
        return shopHoursService.getAllShopHours();
    }

    // GET /shop-hours/{giorno} - Ottieni orari per un giorno specifico (0=Dom, 6=Sab)
    @GetMapping("/{giorno}")
    public ResponseEntity<ShopHours> getShopHoursByDay(@PathVariable Integer giorno) {
        Optional<ShopHours> shopHours = shopHoursService.getShopHoursByDay(giorno);
        return shopHours.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // POST /shop-hours - Configura orari di apertura per un giorno (ADMIN)
    @PostMapping
    public ShopHours setShopHours(@RequestBody ShopHoursRequest request) {
        return shopHoursService.setShopHours(
            request.getGiorno(),
            request.getOrarioApertura(),
            request.getOrarioChiusura(),
            request.getIsChiuso()
        );
    }

    // DELETE /shop-hours/{giorno} - Elimina orari per un giorno (ADMIN)
    @DeleteMapping("/{giorno}")
    public ResponseEntity<Void> deleteShopHoursByDay(@PathVariable Integer giorno) {
        shopHoursService.deleteShopHoursByDay(giorno);
        return ResponseEntity.noContent().build();
    }
}
