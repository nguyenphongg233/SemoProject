package com.semo.backend.controller;

import com.semo.backend.service.UserSimulationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/bot")
@PreAuthorize("hasRole('ADMIN')")
public class BotController {

    private final UserSimulationService userSimulationService;

    public BotController(UserSimulationService userSimulationService) {
        this.userSimulationService = userSimulationService;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Boolean>> getBotStatus() {
        return ResponseEntity.ok(Map.of("enabled", userSimulationService.isBotEnabled()));
    }

    @PostMapping("/toggle")
    public ResponseEntity<Map<String, Boolean>> toggleBot() {
        boolean currentState = userSimulationService.isBotEnabled();
        userSimulationService.setBotEnabled(!currentState);
        return ResponseEntity.ok(Map.of("enabled", userSimulationService.isBotEnabled()));
    }
}
