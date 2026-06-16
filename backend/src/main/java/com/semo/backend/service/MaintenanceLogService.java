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
        return createLogInternal(requestDTO.getScooterId(), requestDTO.getDescription());
    }

    @Transactional
    public MaintenanceLogResponseDTO userReportScooter(@NonNull Integer scooterId, String description) {
        authUtil.requireActiveAuthenticatedUser();
        return createLogInternal(scooterId, description);
    }

    private MaintenanceLogResponseDTO createLogInternal(Integer scooterId, String description) {
        if (scooterId == null) {
            throw new IllegalArgumentException("Invalid scooter ID.");
        }
        Scooter scooter = scooterRepository.findById(scooterId)
                .orElseThrow(() -> new RuntimeException("Scooter ID does not exist"));

        if ("IN_USE".equals(scooter.getStatus())) {
            // If it's rented, we still allow marking it as MAINTENANCE so the admin knows.
            // But we shouldn't throw an error. The ride will end via the frontend calling handleEnd().
        }

        scooter.setStatus("MAINTENANCE");

        MaintenanceLog maintenanceLog = new MaintenanceLog();
        maintenanceLog.setDescription(description);
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
