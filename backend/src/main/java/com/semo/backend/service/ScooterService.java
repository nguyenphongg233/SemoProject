package com.semo.backend.service;

import com.semo.backend.dto.ScooterRequestDTO;
import com.semo.backend.dto.ScooterResponseDTO;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ScooterService {
    ScooterResponseDTO createScooter(ScooterRequestDTO requestDTO);
    List<ScooterResponseDTO> getAllScooters();
    Page<ScooterResponseDTO> getAllScootersPaged(int page, int size);
}