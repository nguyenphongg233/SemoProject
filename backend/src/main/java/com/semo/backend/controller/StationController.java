package com.semo.backend.controller;

import com.semo.backend.dto.ScooterResponseDTO;
import com.semo.backend.dto.StationRequestDTO;
import com.semo.backend.dto.StationResponseDTO;
import com.semo.backend.repository.ScooterRepository;
import com.semo.backend.service.ScooterService;
import com.semo.backend.service.StationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stations")
public class StationController {

    private final StationService stationService;
    private final ScooterRepository scooterRepository;
    private final ScooterService scooterService;

    public StationController(StationService stationService, ScooterRepository scooterRepository, ScooterService scooterService) {
        this.stationService = stationService;
        this.scooterRepository = scooterRepository;
        this.scooterService = scooterService;
    }

    @GetMapping
    public ResponseEntity<List<StationResponseDTO>> getAllStations(@RequestParam(required = false, defaultValue = "false") boolean activeOnly) {
        if (activeOnly) {
            return ResponseEntity.ok(stationService.getActiveStations());
        }
        return ResponseEntity.ok(stationService.getAllStations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StationResponseDTO> getStationById(@PathVariable Integer id) {
        return ResponseEntity.ok(stationService.getStationById(id));
    }

    @PostMapping
    public ResponseEntity<StationResponseDTO> createStation(@Valid @RequestBody StationRequestDTO requestDTO) {
        return ResponseEntity.ok(stationService.createStation(requestDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StationResponseDTO> updateStation(@PathVariable Integer id, @Valid @RequestBody StationRequestDTO requestDTO) {
        return ResponseEntity.ok(stationService.updateStation(id, requestDTO));
    }

    @GetMapping("/{id}/scooters")
    public ResponseEntity<List<ScooterResponseDTO>> getScootersByStation(@PathVariable Integer id) {
        List<ScooterResponseDTO> scooters = scooterRepository.findByStationIdAndStatus(id, "AVAILABLE").stream()
                .map(scooter -> scooterService.getScooterById(scooter.getId()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(scooters);
    }

    @GetMapping("/debug")
    public ResponseEntity<java.util.Map<String, Object>> debugDb() {
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("total_stations", stationService.getAllStations().size());
        stats.put("total_scooters", scooterRepository.count());
        stats.put("total_available_scooters", scooterRepository.countByStatus("AVAILABLE"));
        
        java.util.List<java.util.Map<String, Object>> stationStats = new java.util.ArrayList<>();
        for (StationResponseDTO st : stationService.getAllStations()) {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("station_id", st.getId());
            map.put("station_name", st.getName());
            map.put("available", scooterRepository.countByStationIdAndStatus(st.getId(), "AVAILABLE"));
            map.put("total", scooterRepository.findByStationId(st.getId()).size());
            stationStats.add(map);
        }
        stats.put("station_details", stationStats);
        
        return ResponseEntity.ok(stats);
    }
}
