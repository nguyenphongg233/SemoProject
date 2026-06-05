package com.semo.backend.controller;

import com.semo.backend.dto.SystemConfigRequestDTO;
import com.semo.backend.dto.SystemConfigResponseDTO;
import com.semo.backend.dto.SystemConfigUpdateRequestDTO;
import com.semo.backend.service.SystemConfigService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/configs")
@PreAuthorize("hasRole('ADMIN')")
public class SystemConfigController {

    private final SystemConfigService configService;

    public SystemConfigController(SystemConfigService configService) {
        this.configService = configService;
    }

    // TẠO MỚI (POST /api/admin/configs)
    @PostMapping
    public ResponseEntity<SystemConfigResponseDTO> createConfig(@Valid @RequestBody SystemConfigRequestDTO requestDTO) {
        SystemConfigResponseDTO responseDTO = configService.createConfig(requestDTO);
        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }

    // CẬP NHẬT (PUT /api/admin/configs/{key})
    @PutMapping("/{key}")
    public ResponseEntity<SystemConfigResponseDTO> updateConfig(
            @PathVariable String key,
            @Valid @RequestBody SystemConfigUpdateRequestDTO requestDTO) {

        SystemConfigResponseDTO responseDTO = configService.updateConfig(key, requestDTO);

        return ResponseEntity.ok(responseDTO);
    }

    // XÓA (DELETE /api/admin/configs/{key})
    @DeleteMapping("/{key}")
    public ResponseEntity<Void> deleteConfig(@PathVariable String key) {
        configService.deleteConfig(key);

        return ResponseEntity.noContent().build();
    }

    // LẤY TẤT CẢ (GET /api/admin/configs)
    @GetMapping
    public ResponseEntity<java.util.List<SystemConfigResponseDTO>> getAllConfigs() {
        return ResponseEntity.ok(configService.getAllConfigs());
    }

    // LẤY CHI TIẾT THEO KEY (GET /api/admin/configs/{key})
    @GetMapping("/{key}")
    public ResponseEntity<SystemConfigResponseDTO> getConfigByKey(@PathVariable String key) {
        return ResponseEntity.ok(configService.getConfigByKey(key));
    }
}