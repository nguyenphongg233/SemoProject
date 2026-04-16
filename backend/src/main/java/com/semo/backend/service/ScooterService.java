package com.semo.backend.service;

import java.util.List;

import org.springframework.data.domain.Page;

import com.semo.backend.dto.ScooterRequestDTO;
import com.semo.backend.dto.ScooterResponseDTO;

public interface ScooterService {
    ScooterResponseDTO createScooter(ScooterRequestDTO requestDTO);

    List<ScooterResponseDTO> getAllScooters();

    Page<ScooterResponseDTO> getAllScootersPaged(int page, int size);

    List<ScooterResponseDTO> getScootersByStatus(String status);

    ScooterResponseDTO getScooterById(Integer id);

    ScooterResponseDTO updateScooter(Integer id, ScooterRequestDTO requestDTO);
}