package com.semo.backend.service;

import java.util.ArrayList;
import java.util.List;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import com.semo.backend.dto.MaintenanceLogRequestDTO;
import com.semo.backend.dto.MaintenanceLogResponseDTO;
import com.semo.backend.dto.ResolveMaintenanceRequestDTO;
import com.semo.backend.entity.MaintenanceLog;
import com.semo.backend.entity.Scooter;
import com.semo.backend.repository.MaintenanceLogRepository;
import com.semo.backend.repository.ScooterRepository;

import org.springframework.lang.NonNull;


@Service
public class MaintenanceLogService {

    private final MaintenanceLogRepository maintenanceLogRepository;
    private final ScooterRepository scooterRepository;
    private final com.semo.backend.util.AuthUtil authUtil;

    public MaintenanceLogService(MaintenanceLogRepository maintenanceLogRepository,
            ScooterRepository scooterRepository,
            com.semo.backend.util.AuthUtil authUtil) {
        this.maintenanceLogRepository = maintenanceLogRepository;
        this.scooterRepository = scooterRepository;
        this.authUtil = authUtil;
    }

    @Transactional
    public MaintenanceLogResponseDTO createMaintenanceLog(MaintenanceLogRequestDTO requestDTO) {
        authUtil.requireAdminAccess("Permission denied: Only Administrators can use this feature!");
        if (requestDTO.getScooterId() == null) {
            throw new IllegalArgumentException("Invalid scooter ID.");
        }
        Scooter scooter = scooterRepository.findById(java.util.Objects.requireNonNull(requestDTO.getScooterId()))
                .orElseThrow(() -> new RuntimeException("Scooter ID does not exist"));

        if ("IN_USE".equals(scooter.getStatus())) {
            throw new RuntimeException("Cannot maintain a scooter currently rented by a customer. Please end the ride first!");
        }

        scooter.setStatus("MAINTENANCE");

        MaintenanceLog maintenanceLog = new MaintenanceLog();
        maintenanceLog.setDescription(requestDTO.getDescription());
        maintenanceLog.setCost(0.0);
        maintenanceLog.setScooter(scooter);

        maintenanceLog = maintenanceLogRepository.save(maintenanceLog);

        return mapToResponseDTO(maintenanceLog);
    }

    public List<MaintenanceLogResponseDTO> getMaintenanceLogsByScooterId(@NonNull Integer scooterId) {
        if (!scooterRepository.existsById(scooterId)) {
            throw new RuntimeException("Scooter ID does not exist");
        }

        List<MaintenanceLog> logs = maintenanceLogRepository.findByScooterId(scooterId);
        List<MaintenanceLogResponseDTO> responseDTOs = new ArrayList<>();

        for (MaintenanceLog log : logs) {
            responseDTOs.add(mapToResponseDTO(log));
        }

        return responseDTOs;
    }

    private MaintenanceLogResponseDTO mapToResponseDTO(MaintenanceLog maintenanceLog) {
        MaintenanceLogResponseDTO responseDTO = new MaintenanceLogResponseDTO();
        responseDTO.setId(maintenanceLog.getId());
        responseDTO.setScooterId(maintenanceLog.getScooter().getId());
        responseDTO.setDescription(maintenanceLog.getDescription());
        responseDTO.setCost(maintenanceLog.getCost());
        responseDTO.setCreatedAt(maintenanceLog.getCreatedAt());
        return responseDTO;
    }

    @Transactional
    public void resolveMaintenance(@NonNull Integer scooterId, ResolveMaintenanceRequestDTO requestDTO) {
        authUtil.requireAdminAccess("Permission denied: Only Administrators can use this feature!");
        Scooter scooter = scooterRepository.findById(scooterId)
                .orElseThrow(() -> new RuntimeException("Scooter not found with ID: " + scooterId));

        if (!"MAINTENANCE".equals(scooter.getStatus())) {
            throw new RuntimeException("This scooter is not in the maintenance list!");
        }

        Double cost = requestDTO.getCost();

        MaintenanceLog latestLog = maintenanceLogRepository.findFirstByScooterIdOrderByCreatedAtDesc(scooterId)
                .orElseThrow(() -> new RuntimeException("No maintenance log found for this scooter"));

        latestLog.setCost(cost);

        scooter.setStatus("AVAILABLE");
        scooter.setBatteryLevel(100);
        scooter.setTemperature(25.0);
    }
}
