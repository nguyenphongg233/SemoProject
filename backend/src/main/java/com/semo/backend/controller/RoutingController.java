package com.semo.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.lang.NonNull;

import com.semo.backend.dto.RoutingResponseDTO;
import com.semo.backend.dto.ScooterResponseDTO;
import com.semo.backend.service.RoutingService;
import com.semo.backend.service.ScooterService;

@RestController
@RequestMapping("/api/routing")
public class RoutingController {

    private final RoutingService routingService;
    private final ScooterService scooterService;

    public RoutingController(RoutingService routingService, ScooterService scooterService) {
        this.routingService = routingService;
        this.scooterService = scooterService;
    }

    @GetMapping("/scooter/{scooterId}")
    public ResponseEntity<RoutingResponseDTO> getRouteToScooter(
            @PathVariable @NonNull Integer scooterId,
            @RequestParam double userLat,
            @RequestParam double userLng) {

        ScooterResponseDTO scooter = scooterService.getScooterById(scooterId);

        if (scooter.getCurrentLat() == null || scooter.getCurrentLng() == null) {
            throw new RuntimeException("Invalid scooter coordinates.");
        }

        RoutingResponseDTO response = routingService.findShortestPath(
                userLat, userLng,
                scooter.getCurrentLat(), scooter.getCurrentLng());

        return ResponseEntity.ok(response);
    }
}
