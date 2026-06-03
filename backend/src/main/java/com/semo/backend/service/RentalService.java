package com.semo.backend.service;

import com.semo.backend.dto.RentalRequestDTO;
import com.semo.backend.dto.RentalResponseDTO;
import com.semo.backend.entity.Rental;
import com.semo.backend.entity.Scooter;
import com.semo.backend.entity.User;
import com.semo.backend.repository.RentalRepository;
import com.semo.backend.repository.ScooterRepository;
import com.semo.backend.repository.UserRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Array;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class RentalService {

    private final RentalRepository rentalRepository;
    private final ScooterRepository scooterRepository;
    private final UserRepository userRepository;
    private static final List<String> VALID_STATUSES = List.of("ALL", "ACTIVE", "COMPLETED");

    public RentalService(RentalRepository rentalRepository, ScooterRepository scooterRepository, UserRepository userRepository) {
        this.rentalRepository = rentalRepository;
        this.scooterRepository = scooterRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public RentalResponseDTO startRental(RentalRequestDTO requestDTO) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new RuntimeException("Truy cập bị từ chối: Vui lòng đăng nhập lại!");
        }
        
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Khách hàng"));

        Scooter scooter = scooterRepository.findById(requestDTO.getScooterId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Xe"));

        if (!"ADMIN".equals(user.getRole()) && user.getBalance() < 50000.0) {
            throw new RuntimeException("Số dư tài khoản không đủ để bắt đầu chuyến đi. Vui lòng đảm bảo trong ví có ít nhất 50.000 VNĐ.");
        }

        if (!"AVAILABLE".equals(scooter.getStatus())) {
            throw new RuntimeException("Xe này hiện không khả dụng để thuê!");
        }

        scooter.setStatus("IN_USE");

        if (!"ADMIN".equals(user.getRole()))
            user.subtractBalance(50000.0);

        Rental rental = new Rental(user, scooter);
        rental = rentalRepository.save(rental);

        return mapToDTO(rental);
    }

    @Transactional
    public RentalResponseDTO endRental(Integer rentalId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new RuntimeException("Truy cập bị từ chối: Vui lòng đăng nhập lại!");
        }

        User loggedInUser = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hệ thống"));

        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chuyến đi"));

        User rentalOwner = rental.getUser();

        if (!rentalOwner.getId().equals(loggedInUser.getId()) && !"ADMIN".equals(loggedInUser.getRole())) {
            throw new RuntimeException("Lỗi bảo mật: Bạn không có quyền kết thúc chuyến đi của người khác!");
        }

        if ("COMPLETED".equals(rental.getStatus()))
            throw new RuntimeException("Chuyến đi này đã được thanh toán rồi!");

        rental.setEndTime(LocalDateTime.now());

        Scooter scooter = rental.getScooter();

        long minutes = Duration.between(rental.getStartTime(), rental.getEndTime()).toMinutes();
        if (minutes < 1)
            minutes = 1;

        double amount = minutes * 1000.0;
        if ("ADMIN".equals(rentalOwner.getRole()))
            amount = 0.0;

        rental.setTotalPrice(amount);
        rental.setStatus("COMPLETED");

        scooter.setStatus("AVAILABLE");

        if (!"ADMIN".equals(rentalOwner.getRole()))
            rentalOwner.subtractBalance(amount - 50000.0);

        return mapToDTO(rental);
    }

    @Transactional(readOnly = true)
    public List<RentalResponseDTO> getRentalHistory(String status) {
        status = (status == null || status.isBlank()) ? "ALL" : status.trim().toUpperCase();
        if (!VALID_STATUSES.contains(status)) {
            throw new RuntimeException("Trạng thái không hợp lệ!");
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new RuntimeException("Truy cập bị từ chối: Vui lòng đăng nhập lại!");
        }

        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hệ thống"));

        boolean isAdmin = "ADMIN".equals(user.getRole()),
                isAllStatus = "ALL".equals(status);

        List<Rental> rentals;

        if (isAdmin) {
            rentals = isAllStatus ? rentalRepository.findAllByOrderByStartTimeDesc()
                                  : rentalRepository.findByStatusOrderByStartTimeDesc(status);
        }
        else {
            rentals = isAllStatus ? rentalRepository.findByUserOrderByStartTimeDesc(user)
                                  : rentalRepository.findByUserAndStatusOrderByStartTimeDesc(user, status);
        }

        return rentals.stream()
                .map(this::mapToDTO)
                .toList();
    }

    private RentalResponseDTO mapToDTO(Rental rental) {
        RentalResponseDTO dto = new RentalResponseDTO();
        dto.setId(rental.getId());
        dto.setUserId(rental.getUser().getId());
        dto.setScooterId(rental.getScooter().getId());
        dto.setStartTime(rental.getStartTime());
        dto.setEndTime(rental.getEndTime());
        dto.setTotalPrice(rental.getTotalPrice());
        dto.setStatus(rental.getStatus());
        return dto;
    }
}
