package com.semo.backend.controller;

import java.util.List;

import com.semo.backend.service.ScooterService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.core.io.InputStreamResource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.lang.NonNull;

import com.semo.backend.dto.ScooterRequestDTO;
import com.semo.backend.dto.ScooterResponseDTO;
import com.semo.backend.entity.Scooter;
import com.semo.backend.repository.ScooterRepository;
import com.semo.backend.service.ExportService;

import java.io.ByteArrayInputStream;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/scooters")
public class ScooterController {

    private final ScooterService scooterService;
    private final ScooterRepository scooterRepository;
    private final ExportService exportService;

    public ScooterController(ScooterService scooterService, ScooterRepository scooterRepository, ExportService exportService) {
        this.scooterService = scooterService;
        this.scooterRepository = scooterRepository;
        this.exportService = exportService;
    }

    @PostMapping
    public ResponseEntity<ScooterResponseDTO> createScooter(@Valid @RequestBody ScooterRequestDTO requestDTO) {
        ScooterResponseDTO responseDTO = scooterService.createScooter(requestDTO);
        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }

    @GetMapping
    public List<ScooterResponseDTO> getAllScooters() {
        return scooterService.getAllScooters();
    }

    // Export all scooters to Excel (Dành cho Admin)
    @GetMapping("/export")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<InputStreamResource> exportScootersToExcel() {
        List<Scooter> scooters = scooterRepository.findAll();
        ByteArrayInputStream in = exportService.exportScootersToExcel(scooters);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=scooters.xlsx");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }

    // Endpoint: GET /api/scooters/paged?page=0&size=5
    @GetMapping("/paged")
    public ResponseEntity<Page<ScooterResponseDTO>> getAllScootersPaged(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ScooterResponseDTO> pagedResult = scooterService.getAllScootersPaged(page, size);
        return ResponseEntity.ok(pagedResult);
    }

    // Endpoint: GET /api/scooters/status?status=AVAILABLE
    @GetMapping("/status")
    public ResponseEntity<List<ScooterResponseDTO>> getScootersByStatus(
            @RequestParam(defaultValue = "AVAILABLE") String status) {

        List<ScooterResponseDTO> scooters = scooterService.getScootersByStatus(status);
        return ResponseEntity.ok(scooters);
    }

    // Endpoint: GET /api/scooters/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ScooterResponseDTO> getScooterById(@PathVariable @NonNull Integer id) {
        ScooterResponseDTO scooter = scooterService.getScooterById(id);
        return ResponseEntity.ok(scooter);
    }

    // Endpoint: PUT /api/scooters/{id}
    @PutMapping("/{id}")
    public ResponseEntity<ScooterResponseDTO> updateScooter(@PathVariable @NonNull Integer id,
            @Valid @RequestBody ScooterRequestDTO requestDTO) {
        ScooterResponseDTO responseDTO = scooterService.updateScooter(id, requestDTO);
        return ResponseEntity.ok(responseDTO);
    }

    // Endpoint: DELETE /api/scooters/{id}
    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    public ResponseEntity<String> deleteScooter(@PathVariable @NonNull Integer id) {
        scooterService.deleteScooter(id);
        return ResponseEntity.ok("Đã xóa thành công xe với ID: " + id);
    }
}