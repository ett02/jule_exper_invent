package com.example.demo.controller;

import com.example.demo.model.ShopSettings;
import com.example.demo.repository.ShopSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/shop-settings")
public class ShopSettingsController {

    @Autowired
    private ShopSettingsRepository shopSettingsRepository;

    // GET tutti gli orari di apertura
    @GetMapping
    public List<ShopSettings> getAllSettings() {
        return shopSettingsRepository.findAll();
    }

    // GET orari per giorno specifico
    @GetMapping("/day/{giorno}")
    public ResponseEntity<ShopSettings> getSettingsByDay(@PathVariable Integer giorno) {
        return shopSettingsRepository.findByGiorno(giorno)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST/PUT configura orari apertura (ADMIN)
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ShopSettings saveSettings(@RequestBody ShopSettings settings) {
        return shopSettingsRepository.save(settings);
    }

    // DELETE rimuovi configurazione giorno (ADMIN)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteSettings(@PathVariable Long id) {
        shopSettingsRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
