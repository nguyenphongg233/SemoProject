package com.semo.backend.service;

import com.semo.backend.dto.ScooterResponseDTO;
import com.semo.backend.entity.Scooter;
import com.semo.backend.repository.ScooterRepository;
import com.semo.backend.repository.SystemConfigRepository;
import com.semo.backend.util.AuthUtil;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.lang.NonNull;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChargingService {

    private final ScooterRepository scooterRepository;
    private final SystemConfigRepository configRepository;
    private final AuthUtil authUtil;

    private static final int STATION_CAPACITY = 5;

    public ChargingService(ScooterRepository scooterRepository, SystemConfigRepository configRepository, AuthUtil authUtil) {
        this.scooterRepository = scooterRepository;
        this.configRepository = configRepository;
        this.authUtil = authUtil;
    }

    private double getConfig(String key, double defaultValue) {
        return configRepository.findById(key)
                .map(c -> {
                    try {
                        return Double.parseDouble(c.getConfigValue());
                    } catch (NumberFormatException e) {
                        return defaultValue;
                    }
                })
                .orElse(defaultValue);
    }

    @Transactional
    public List<ScooterResponseDTO> autoScheduleCharging() {
        authUtil.requireAdminAccess("Permission denied: Only Administrators can coordinate scooter charging!");

        int lowBatteryThreshold = (int) getConfig("MAINTENANCE_THRESHOLD", 20.0);

        Pageable limit = PageRequest.of(0, STATION_CAPACITY);
        List<Scooter> scootersToCharge = scooterRepository.findScootersForCharging(lowBatteryThreshold, limit);

        if (scootersToCharge.isEmpty()) {
            return List.of();
        }

        for (Scooter scooter : scootersToCharge) {
            scooter.setStatus("CHARGING");
        }

        return scootersToCharge.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ScooterResponseDTO completeCharging(@NonNull Integer scooterId) {
        authUtil.requireAdminAccess("Permission denied: Only Administrators can accept scooter charging!");

        Scooter scooter = scooterRepository.findById(scooterId)
                .orElseThrow(() -> new RuntimeException("Scooter not found with ID: " + scooterId));

        if (!"CHARGING".equals(scooter.getStatus())) {
            throw new RuntimeException("This scooter is not in CHARGING state!");
        }

        scooter.setBatteryLevel(100);
        scooter.setCycleCount(scooter.getCycleCount() + 1);

        double newHealth = Math.max(0.0, scooter.getStateOfHealth() - 0.2);
        scooter.setStateOfHealth(Math.round(newHealth * 10.0) / 10.0);

        scooter.setTemperature(25.0);
        scooter.setStatus("AVAILABLE");

        return mapToResponseDTO(scooter);
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