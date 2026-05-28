package com.semo.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.semo.backend.dto.MaintenanceLogRequestDTO;
import com.semo.backend.dto.MaintenanceLogResponseDTO;
import com.semo.backend.service.MaintenanceLogService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceLogController {

    private final MaintenanceLogService maintenanceLogService;

    public MaintenanceLogController(MaintenanceLogService maintenanceLogService) {
        this.maintenanceLogService = maintenanceLogService;
    }

    @PostMapping
    public ResponseEntity<MaintenanceLogResponseDTO> createMaintenanceLog(
            @Valid @RequestBody MaintenanceLogRequestDTO requestDTO) {
        MaintenanceLogResponseDTO responseDTO = maintenanceLogService.createMaintenanceLog(requestDTO);
        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }

    @GetMapping("/scooter/{scooterId}")
    public ResponseEntity<List<MaintenanceLogResponseDTO>> getMaintenanceLogsByScooterId(
            @PathVariable Integer scooterId) {
        List<MaintenanceLogResponseDTO> logs = maintenanceLogService.getMaintenanceLogsByScooterId(scooterId);
        return ResponseEntity.ok(logs);
    }

    @PostMapping("/{scooterId}/resolve")
    public ResponseEntity<String> resolveEntity(@PathVariable Integer scooterId) {
        maintenanceLogService.resolveMaintenance(scooterId);
        return ResponseEntity.ok("Đã sửa chữa và sạc đầy xe thành công! Xe đã sẵn sàng phục vụ.");
    }

}
