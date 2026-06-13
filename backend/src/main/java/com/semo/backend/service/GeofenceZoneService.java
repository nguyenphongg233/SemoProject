package com.semo.backend.service;

import com.semo.backend.dto.GeofenceZoneRequestDTO;
import com.semo.backend.dto.GeofenceZoneResponseDTO;
import com.semo.backend.entity.GeofenceZone;
import com.semo.backend.repository.GeofenceZoneRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.lang.NonNull;


@Service
public class GeofenceZoneService {

    private final GeofenceZoneRepository geofenceZoneRepository;

    public GeofenceZoneService(GeofenceZoneRepository geofenceZoneRepository) {
        this.geofenceZoneRepository = geofenceZoneRepository;
    }

    @Transactional
    public GeofenceZoneResponseDTO createZone(GeofenceZoneRequestDTO requestDTO) {
        if (geofenceZoneRepository.existsByName(requestDTO.getName())) {
            throw new RuntimeException("Tên khu vực này đã tồn tại!");
        }

        GeofenceZone zone = new GeofenceZone();
        zone.setName(requestDTO.getName());
        zone.setCenterLat(requestDTO.getCenterLat());
        zone.setCenterLng(requestDTO.getCenterLng());
        zone.setRadiusKm(requestDTO.getRadiusKm());

        zone = geofenceZoneRepository.save(zone);
        return mapToDTO(zone);
    }

    public List<GeofenceZoneResponseDTO> getAllZones() {
        return geofenceZoneRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public GeofenceZoneResponseDTO updateZone(@NonNull Integer id, GeofenceZoneRequestDTO requestDTO) {
        GeofenceZone zone = geofenceZoneRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khu vực với ID: " + id));

        zone.setName(requestDTO.getName());
        zone.setCenterLat(requestDTO.getCenterLat());
        zone.setCenterLng(requestDTO.getCenterLng());
        zone.setRadiusKm(requestDTO.getRadiusKm());

        return mapToDTO(zone);
    }

    @Transactional
    public void deleteZone(@NonNull Integer id) {
        if (!geofenceZoneRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy khu vực với ID: " + id);
        }
        geofenceZoneRepository.deleteById(id);
    }

    private GeofenceZoneResponseDTO mapToDTO(GeofenceZone zone) {
        GeofenceZoneResponseDTO dto = new GeofenceZoneResponseDTO();
        dto.setId(zone.getId());
        dto.setName(zone.getName());
        dto.setCenterLat(zone.getCenterLat());
        dto.setCenterLng(zone.getCenterLng());
        dto.setRadiusKm(zone.getRadiusKm());
        return dto;
    }
}