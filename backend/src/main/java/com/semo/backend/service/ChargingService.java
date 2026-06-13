package com.semo.backend.service;

import com.semo.backend.dto.ScooterResponseDTO;
import com.semo.backend.entity.Scooter;
import com.semo.backend.repository.ScooterRepository;
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
    private final AuthUtil authUtil;

    private static final int LOW_BATTERY_THRESHOLD = 20;
    private static final int STATION_CAPACITY = 5;

    public ChargingService(ScooterRepository scooterRepository, AuthUtil authUtil) {
        this.scooterRepository = scooterRepository;
        this.authUtil = authUtil;
    }

    @Transactional
    public List<ScooterResponseDTO> autoScheduleCharging() {
        authUtil.requireAdminAccess("Lỗi phân quyền: Chỉ Quản trị viên mới được điều phối sạc xe!");

        Pageable limit = PageRequest.of(0, STATION_CAPACITY);
        List<Scooter> scootersToCharge = scooterRepository.findScootersForCharging(LOW_BATTERY_THRESHOLD, limit);

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
        authUtil.requireAdminAccess("Lỗi phân quyền: Chỉ Quản trị viên mới được nghiệm thu sạc xe!");

        Scooter scooter = scooterRepository.findById(scooterId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe với ID: " + scooterId));

        if (!"CHARGING".equals(scooter.getStatus())) {
            throw new RuntimeException("Xe này không ở trạng thái Đang sạc (CHARGING)!");
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