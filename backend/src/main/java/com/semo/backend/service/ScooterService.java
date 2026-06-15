package com.semo.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.semo.backend.dto.ScooterRequestDTO;
import com.semo.backend.dto.ScooterResponseDTO;
import com.semo.backend.entity.Scooter;
import com.semo.backend.repository.ScooterRepository;
import com.semo.backend.util.AuthUtil;

@Service
public class ScooterService {
    private final ScooterRepository scooterRepository;
    private final AuthUtil authUtil;

    private static final List<String> VALID_STATUSES = List.of("AVAILABLE", "MAINTENANCE", "IN_USE", "CHARGING");

    public ScooterService(ScooterRepository scooterRepository, AuthUtil authUtil) {
        this.scooterRepository = scooterRepository;
        this.authUtil = authUtil;
    }

    private String validateAndNormalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return "AVAILABLE";
        }
        status = status.trim().toUpperCase();
        if (!VALID_STATUSES.contains(status)) {
            throw new RuntimeException("Invalid scooter state! Please select: AVAILABLE, IN_USE, or MAINTENANCE.");
        }
        return status;
    }

    @Transactional
    public ScooterResponseDTO createScooter(ScooterRequestDTO requestDTO) {
        authUtil.requireAdminAccess("Permission denied: Only Administrators are allowed to perform this action!");
        Scooter scooter = new Scooter();
        scooter.setName(requestDTO.getName());
        scooter.setBatteryLevel(requestDTO.getBatteryLevel());
        scooter.setStatus(validateAndNormalizeStatus(requestDTO.getStatus()));
        scooter.setCurrentLat(requestDTO.getCurrentLat());
        scooter.setCurrentLng(requestDTO.getCurrentLng());

        scooter = scooterRepository.save(scooter);
        return mapToResponseDTO(scooter);
    }

    @Transactional(readOnly = true)
    public List<ScooterResponseDTO> getAllScooters() {
        return scooterRepository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ScooterResponseDTO> getAllScootersPaged(int page, int size) {
        Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return scooterRepository.findAll(pageable).map(this::mapToResponseDTO);
    }

    @Transactional(readOnly = true)
    public List<ScooterResponseDTO> getScootersByStatus(String status) {
        status = validateAndNormalizeStatus(status);
        return scooterRepository.findByStatus(status)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ScooterResponseDTO getScooterById(@NonNull Integer id) {
        Scooter scooter = scooterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Scooter not found with ID: " + id));
        return mapToResponseDTO(scooter);
    }

    @Transactional
    public ScooterResponseDTO updateScooter(@NonNull Integer id, ScooterRequestDTO requestDTO) {
        authUtil.requireAdminAccess("Permission denied: Only Administrators are allowed to perform this action!");

        Scooter scooter = scooterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Scooter not found with ID: " + id));

        scooter.setName(requestDTO.getName());
        scooter.setBatteryLevel(requestDTO.getBatteryLevel());
        scooter.setStatus(validateAndNormalizeStatus(requestDTO.getStatus()));
        if (requestDTO.getCurrentLat() != null) {
            scooter.setCurrentLat(requestDTO.getCurrentLat());
        }
        if (requestDTO.getCurrentLng() != null) {
            scooter.setCurrentLng(requestDTO.getCurrentLng());
        }

        Scooter updatedScooter = scooterRepository.save(scooter);
        return mapToResponseDTO(updatedScooter);
    }

    @Transactional
    public void deleteScooter(@NonNull Integer id) {
        authUtil.requireAdminAccess("Permission denied: Only Administrators are allowed to perform this action!");
        Scooter scooter = scooterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Scooter not found with ID: " + id));

        if ("IN_USE".equals(scooter.getStatus())) {
            throw new RuntimeException("Cannot delete scooter currently rented. Please end the ride first!");
        }

        try {
            scooterRepository.delete(scooter);
            // Flush required to immediately catch constraint violation inside try-catch block
            scooterRepository.flush();
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new RuntimeException("Cannot delete this scooter because it has rental or maintenance history!");
        }
    }

    private ScooterResponseDTO mapToResponseDTO(Scooter scooter) {
        ScooterResponseDTO dto = new ScooterResponseDTO();
        if (scooter.getId() != null)
            dto.setId(scooter.getId());
        dto.setName(scooter.getName());
        dto.setBatteryLevel(scooter.getBatteryLevel());
        dto.setCycleCount(scooter.getCycleCount());
        dto.setStateOfHealth(scooter.getStateOfHealth());
        dto.setTemperature(scooter.getTemperature());
        dto.setStatus(scooter.getStatus());
        dto.setCurrentLat(scooter.getCurrentLat());
        dto.setCurrentLng(scooter.getCurrentLng());
        dto.setCreatedAt(scooter.getCreatedAt());
        dto.setUpdatedAt(scooter.getUpdatedAt());

        return dto;
    }
}