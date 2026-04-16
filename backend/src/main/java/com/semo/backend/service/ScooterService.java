package com.semo.backend.service;

import com.semo.backend.dto.ScooterRequestDTO;
import com.semo.backend.dto.ScooterResponseDTO;
import java.util.List;

public interface ScooterService {
    ScooterResponseDTO createScooter(ScooterRequestDTO requestDTO);
    List<ScooterResponseDTO> getAllScooters();
}