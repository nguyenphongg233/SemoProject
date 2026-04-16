package com.semo.backend.controller;

import com.semo.backend.dto.ScooterRequestDTO;
import com.semo.backend.dto.ScooterResponseDTO;
import com.semo.backend.entity.Scooter;
import com.semo.backend.repository.ScooterRepository;
import com.semo.backend.service.ScooterService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scooters")
public class ScooterController {

    private final ScooterRepository scooterRepository;
    private final ScooterService scooterService;

    public ScooterController(ScooterRepository scooterRepository, ScooterService scooterService) {
        this.scooterRepository = scooterRepository;
        this.scooterService = scooterService;
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
}