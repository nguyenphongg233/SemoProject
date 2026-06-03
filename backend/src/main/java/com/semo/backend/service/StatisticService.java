package com.semo.backend.service;

import com.semo.backend.dto.StatisticResponseDTO;
import com.semo.backend.entity.User;
import com.semo.backend.repository.RentalRepository;
import com.semo.backend.repository.ScooterRepository;
import com.semo.backend.repository.UserRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StatisticService {

    private final RentalRepository rentalRepository;
    private final ScooterRepository scooterRepository;
    private final UserRepository userRepository;

    public StatisticService(RentalRepository rentalRepository, ScooterRepository scooterRepository, UserRepository userRepository) {
        this.rentalRepository = rentalRepository;
        this.scooterRepository = scooterRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public StatisticResponseDTO getDashboardStats() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new RuntimeException("Truy cập bị từ chối: Vui lòng đăng nhập lại!");
        }

        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hệ thống"));

        if (!"ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Lỗi phân quyền: Chỉ Quản trị viên mới được xem bảng thống kê!");
        }

        Double totalRevenue = rentalRepository.sumTotalPriceByStatus("COMPLETED");
        Long totalCompletedRentals = rentalRepository.countByStatus("COMPLETED");
        Long activeRentals = rentalRepository.countByStatus("ACTIVE");

        Long availableScooters = scooterRepository.countByStatus("AVAILABLE");
        Long maintenanceScooters = scooterRepository.countByStatus("MAINTENANCE");

        return mapToDTO(totalRevenue, totalCompletedRentals, activeRentals, availableScooters, maintenanceScooters);
    }

    private StatisticResponseDTO mapToDTO(Double totalRevenue, Long totalCompletedRentals,
                                          Long activeRentals, Long availableScooters,
                                          Long maintenanceScooters) {
        StatisticResponseDTO stats = new StatisticResponseDTO();
        stats.setTotalRevenue(totalRevenue);
        stats.setTotalCompletedRentals(totalCompletedRentals);
        stats.setActiveRentals(activeRentals);
        stats.setAvailableScooters(availableScooters);
        stats.setMaintenanceScooters(maintenanceScooters);
        return stats;
    }
}