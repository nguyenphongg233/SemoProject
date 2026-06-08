package com.semo.backend.controller;

import com.semo.backend.dto.PointDTO;
import com.semo.backend.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    // Endpoint: /optimal-stations?k={value}
    @GetMapping("/optimal-stations")
    public ResponseEntity<List<PointDTO>> getOptimalStations(@RequestParam(defaultValue = "3") int k) {
        List<PointDTO> optimalStations = analyticsService.calculateOptimalChargingStations(k);
        return ResponseEntity.ok(optimalStations);
    }

    // Endpoint: /optimal-stations-hdbscan?minClusterSize={value}
    @GetMapping("/optimal-stations-hdbscan")
    public ResponseEntity<List<PointDTO>> getOptimalStationsHDBSCAN(@RequestParam(defaultValue = "5") int minClusterSize) {
        List<PointDTO> optimalStations = analyticsService.calculateOptimalChargingStationsHDBSCAN(minClusterSize);
        return ResponseEntity.ok(optimalStations);
    }
}