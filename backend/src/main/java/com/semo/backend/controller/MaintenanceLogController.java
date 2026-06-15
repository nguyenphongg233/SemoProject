package com.semo.backend.controller;

import java.util.List;

import com.semo.backend.dto.ResolveMaintenanceRequestDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.lang.NonNull;

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
            @PathVariable @NonNull Integer scooterId) {
        List<MaintenanceLogResponseDTO> logs = maintenanceLogService.getMaintenanceLogsByScooterId(scooterId);
        return ResponseEntity.ok(logs);
    }

    @PostMapping("/{scooterId}/resolve")
    public ResponseEntity<String> resolveEntity(@PathVariable @NonNull Integer scooterId,
                                                @RequestBody @Valid ResolveMaintenanceRequestDTO requestDTO) {
        maintenanceLogService.resolveMaintenance(scooterId, requestDTO);

        return ResponseEntity.ok("Đã sửa chữa, ghi nhận chi phí " + requestDTO.getCost() + " VNĐ và sạc đầy xe thành công!");
    }

}
