package com.semo.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.semo.backend.dto.ScooterRequestDTO;
import com.semo.backend.dto.ScooterResponseDTO;
import com.semo.backend.entity.Scooter;
import com.semo.backend.repository.ScooterRepository;

@Service
public class ScooterService {

    private final ScooterRepository scooterRepository;

    public ScooterService(ScooterRepository scooterRepository) {
        this.scooterRepository = scooterRepository;
    }

    public ScooterResponseDTO createScooter(ScooterRequestDTO requestDTO) {
        Scooter scooter = new Scooter();
        scooter.setCodeName(requestDTO.getName());
        scooter.setBatteryLevel(requestDTO.getBatteryLevel());
        scooter.setStatus(requestDTO.getStatus());
        scooter.setCurrentLat(requestDTO.getCurrentLat());
        scooter.setCurrentLng(requestDTO.getCurrentLng());

        Scooter savedScooter = scooterRepository.save(scooter);
        return mapToResponseDTO(savedScooter);
    }

    public List<ScooterResponseDTO> getAllScooters() {
        return scooterRepository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public Page<ScooterResponseDTO> getAllScootersPaged(int page, int size) {
        Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return scooterRepository.findAll(pageable).map(this::mapToResponseDTO);
    }

    public List<ScooterResponseDTO> getScootersByStatus(String status) {
        return scooterRepository.findByStatus(status)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public ScooterResponseDTO getScooterById(Integer id) {
        Scooter scooter = scooterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe với ID: " + id));
        return mapToResponseDTO(scooter);
    }

    public ScooterResponseDTO updateScooter(Integer id, ScooterRequestDTO requestDTO) {
        Scooter scooter = scooterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe với ID: " + id));

        scooter.setCodeName(requestDTO.getName());
        scooter.setBatteryLevel(requestDTO.getBatteryLevel());
        scooter.setStatus(requestDTO.getStatus());
        if (requestDTO.getCurrentLat() != null) {
            scooter.setCurrentLat(requestDTO.getCurrentLat());
        }
        if (requestDTO.getCurrentLng() != null) {
            scooter.setCurrentLng(requestDTO.getCurrentLng());
        }

        Scooter updatedScooter = scooterRepository.save(scooter);
        return mapToResponseDTO(updatedScooter);
    }

    private ScooterResponseDTO mapToResponseDTO(Scooter scooter) {
        ScooterResponseDTO dto = new ScooterResponseDTO();
        if (scooter.getId() != null) {
            dto.setId(scooter.getId().longValue());
        }
        dto.setName(scooter.getCodeName());
        dto.setBatteryLevel(scooter.getBatteryLevel());
        dto.setStatus(scooter.getStatus());
        dto.setCurrentLat(scooter.getCurrentLat());
        dto.setCurrentLng(scooter.getCurrentLng());

        dto.setCreatedAt(scooter.getCreatedAt());
        dto.setUpdatedAt(scooter.getUpdatedAt());

        return dto;
    }
}