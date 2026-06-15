package com.semo.backend.controller;

import com.semo.backend.dto.GeofenceZoneRequestDTO;
import com.semo.backend.dto.GeofenceZoneResponseDTO;
import com.semo.backend.service.GeofenceZoneService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.lang.NonNull;

import java.util.List;

@RestController
@RequestMapping("/api/geofence")
public class GeofenceZoneController {

    private final GeofenceZoneService geofenceZoneService;

    public GeofenceZoneController(GeofenceZoneService geofenceZoneService) {
        this.geofenceZoneService = geofenceZoneService;
    }

    @GetMapping
    public ResponseEntity<List<GeofenceZoneResponseDTO>> getAllZones() {
        return ResponseEntity.ok(geofenceZoneService.getAllZones());
    }

    @PostMapping
    public ResponseEntity<GeofenceZoneResponseDTO> createZone(@Valid @RequestBody GeofenceZoneRequestDTO requestDTO) {
        GeofenceZoneResponseDTO responseDTO = geofenceZoneService.createZone(requestDTO);
        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GeofenceZoneResponseDTO> updateZone(
            @PathVariable @NonNull Integer id,
            @Valid @RequestBody GeofenceZoneRequestDTO requestDTO) {
        GeofenceZoneResponseDTO responseDTO = geofenceZoneService.updateZone(id, requestDTO);
        return ResponseEntity.ok(responseDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteZone(@PathVariable @NonNull Integer id) {
        geofenceZoneService.deleteZone(id);
        return ResponseEntity.ok("Đã xóa khu vực an toàn thành công!");
    }
}