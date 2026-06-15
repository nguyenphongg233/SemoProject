package com.semo.backend.service;

import com.semo.backend.dto.StatisticResponseDTO;
import com.semo.backend.repository.RentalRepository;
import com.semo.backend.repository.ScooterRepository;
import com.semo.backend.repository.MaintenanceLogRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StatisticService {

    private final RentalRepository rentalRepository;
    private final ScooterRepository scooterRepository;
    private final MaintenanceLogRepository maintenanceLogRepository;

    public StatisticService(RentalRepository rentalRepository, ScooterRepository scooterRepository,
                            MaintenanceLogRepository maintenanceLogRepository) {
        this.rentalRepository = rentalRepository;
        this.scooterRepository = scooterRepository;
        this.maintenanceLogRepository = maintenanceLogRepository;
    }

    @Transactional(readOnly = true)
    public StatisticResponseDTO getDashboardStats() {

        Double totalRevenue = rentalRepository.sumTotalPriceByStatus("COMPLETED");
        Long totalCompletedRentals = rentalRepository.countByStatus("COMPLETED");
        Long activeRentals = rentalRepository.countByStatus("ACTIVE");

        Long availableScooters = scooterRepository.countByStatus("AVAILABLE");
        Long maintenanceScooters = scooterRepository.countByStatus("MAINTENANCE");

        Double totalMaintenanceCost = maintenanceLogRepository.sumTotalMaintenanceCost();
        if (totalMaintenanceCost == null)
            totalMaintenanceCost = 0.0;

        return mapToDTO(totalRevenue, totalCompletedRentals, activeRentals, availableScooters, maintenanceScooters, totalMaintenanceCost);
    }

    private StatisticResponseDTO mapToDTO(Double totalRevenue, Long totalCompletedRentals, Long activeRentals,
                                          Long availableScooters, Long maintenanceScooters, Double totalMaintenanceCost) {
        StatisticResponseDTO stats = new StatisticResponseDTO();
        stats.setTotalRevenue(totalRevenue);
        stats.setTotalCompletedRentals(totalCompletedRentals);
        stats.setActiveRentals(activeRentals);
        stats.setAvailableScooters(availableScooters);
        stats.setMaintenanceScooters(maintenanceScooters);
        stats.setTotalMaintenanceCost(totalMaintenanceCost);
        return stats;
    }
}