package com.semo.backend.service;

import com.semo.backend.dto.StationRequestDTO;
import com.semo.backend.dto.StationResponseDTO;
import com.semo.backend.entity.Station;
import com.semo.backend.repository.ScooterRepository;
import com.semo.backend.repository.StationRepository;
import com.semo.backend.util.AuthUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StationService {

    private final StationRepository stationRepository;
    private final ScooterRepository scooterRepository;
    private final AuthUtil authUtil;

    public StationService(StationRepository stationRepository, ScooterRepository scooterRepository, AuthUtil authUtil) {
        this.stationRepository = stationRepository;
        this.scooterRepository = scooterRepository;
        this.authUtil = authUtil;
    }

    @Transactional
    public StationResponseDTO createStation(StationRequestDTO requestDTO) {
        authUtil.requireAdminAccess("Permission denied: Only Administrators can create stations!");
        
        Station station = new Station(
            requestDTO.getName(),
            requestDTO.getLat(),
            requestDTO.getLng(),
            requestDTO.getCapacity()
        );
        if (requestDTO.getStatus() != null) {
            station.setStatus(requestDTO.getStatus());
        }
        
        station = stationRepository.save(station);
        return mapToDTO(station);
    }

    @Transactional(readOnly = true)
    public List<StationResponseDTO> getAllStations() {
        return stationRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<StationResponseDTO> getActiveStations() {
        return stationRepository.findByStatus("ACTIVE").stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public StationResponseDTO getStationById(Integer id) {
        Station station = stationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Station not found"));
        return mapToDTO(station);
    }

    @Transactional
    public StationResponseDTO updateStation(Integer id, StationRequestDTO requestDTO) {
        authUtil.requireAdminAccess("Permission denied: Only Administrators can update stations!");
        
        Station station = stationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Station not found"));
        
        station.setName(requestDTO.getName());
        station.setLat(requestDTO.getLat());
        station.setLng(requestDTO.getLng());
        station.setCapacity(requestDTO.getCapacity());
        if (requestDTO.getStatus() != null) {
            station.setStatus(requestDTO.getStatus());
        }
        
        station = stationRepository.save(station);
        return mapToDTO(station);
    }

    private StationResponseDTO mapToDTO(Station station) {
        StationResponseDTO dto = new StationResponseDTO();
        dto.setId(station.getId());
        dto.setName(station.getName());
        dto.setLat(station.getLat());
        dto.setLng(station.getLng());
        dto.setCapacity(station.getCapacity());
        dto.setStatus(station.getStatus());
        dto.setCreatedAt(station.getCreatedAt());
        dto.setUpdatedAt(station.getUpdatedAt());
        
        long count = scooterRepository.countByStationIdAndStatus(station.getId(), "AVAILABLE");
        dto.setAvailableScootersCount(count);
        
        return dto;
    }
}
