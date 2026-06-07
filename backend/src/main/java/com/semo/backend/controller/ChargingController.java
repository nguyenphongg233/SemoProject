package com.semo.backend.controller;

import com.semo.backend.dto.ScooterResponseDTO;
import com.semo.backend.service.ChargingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/charging")
public class ChargingController {

    private final ChargingService chargingService;

    public ChargingController(ChargingService chargingService) {
        this.chargingService = chargingService;
    }

    @PostMapping("/auto-schedule")
    public ResponseEntity<List<ScooterResponseDTO>> autoScheduleCharging() {
        List<ScooterResponseDTO> result = chargingService.autoScheduleCharging();
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<ScooterResponseDTO> completeCharging(@PathVariable("id") Integer scooterId) {
        ScooterResponseDTO result = chargingService.completeCharging(scooterId);
        return ResponseEntity.ok(result);
    }
}