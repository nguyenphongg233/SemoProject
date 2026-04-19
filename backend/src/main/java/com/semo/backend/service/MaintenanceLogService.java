package com.semo.backend.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.semo.backend.dto.MaintenanceLogRequestDTO;
import com.semo.backend.dto.MaintenanceLogResponseDTO;
import com.semo.backend.entity.MaintenanceLog;
import com.semo.backend.entity.Scooter;
import com.semo.backend.repository.MaintenanceLogRepository;
import com.semo.backend.repository.ScooterRepository;

@Service
public class MaintenanceLogService {

    private final MaintenanceLogRepository maintenanceLogRepository;
    private final ScooterRepository scooterRepository;

    public MaintenanceLogService(MaintenanceLogRepository maintenanceLogRepository,
            ScooterRepository scooterRepository) {
        this.maintenanceLogRepository = maintenanceLogRepository;
        this.scooterRepository = scooterRepository;
    }

    public MaintenanceLogResponseDTO createMaintenanceLog(MaintenanceLogRequestDTO requestDTO) {
        Scooter scooter = scooterRepository.findById(requestDTO.getScooterId())
                .orElseThrow(() -> new RuntimeException("ID xe không tồn tại"));

        scooter.setStatus("MAINTENANCE");
        scooterRepository.save(scooter);

        MaintenanceLog maintenanceLog = new MaintenanceLog();
        maintenanceLog.setDescription(requestDTO.getDescription());
        maintenanceLog.setCost(requestDTO.getCost());
        maintenanceLog.setScooter(scooter);

        MaintenanceLog savedLog = maintenanceLogRepository.save(maintenanceLog);

        return mapToResponseDTO(savedLog);
    }

    public List<MaintenanceLogResponseDTO> getMaintenanceLogsByScooterId(Integer scooterId) {
        Scooter scooter = scooterRepository.findById(scooterId)
                .orElseThrow(() -> new RuntimeException("ID xe không tồn tại"));

        List<MaintenanceLog> logs = maintenanceLogRepository.findByScooterId(scooterId);
        List<MaintenanceLogResponseDTO> responseDTOs = new ArrayList<>();

        for (MaintenanceLog log : logs) {
            responseDTOs.add(mapToResponseDTO(log));
        }

        return responseDTOs;
    }

    private MaintenanceLogResponseDTO mapToResponseDTO(MaintenanceLog maintenanceLog) {
        MaintenanceLogResponseDTO responseDTO = new MaintenanceLogResponseDTO();
        responseDTO.setId(maintenanceLog.getId().longValue());
        responseDTO.setScooterId(maintenanceLog.getScooter().getId());
        responseDTO.setDescription(maintenanceLog.getDescription());
        responseDTO.setCost(maintenanceLog.getCost());
        responseDTO.setCreatedAt(maintenanceLog.getCreatedAt());
        return responseDTO;
    }
}
