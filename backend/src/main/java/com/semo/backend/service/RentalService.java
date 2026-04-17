package com.semo.backend.service;

import com.semo.backend.dto.RentalRequestDTO;
import com.semo.backend.dto.RentalResponseDTO;
import com.semo.backend.entity.Rental;
import com.semo.backend.entity.Scooter;
import com.semo.backend.entity.User;
import com.semo.backend.repository.RentalRepository;
import com.semo.backend.repository.ScooterRepository;
import com.semo.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class RentalService {

    private final RentalRepository rentalRepository;
    private final ScooterRepository scooterRepository;
    private final UserRepository userRepository;

    public RentalService(RentalRepository rentalRepository, ScooterRepository scooterRepository, UserRepository userRepository) {
        this.rentalRepository = rentalRepository;
        this.scooterRepository = scooterRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public RentalResponseDTO startRental(RentalRequestDTO requestDTO) {
        User user = userRepository.findById(requestDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Khách hàng"));

        Scooter scooter = scooterRepository.findById(requestDTO.getScooterId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Xe"));

        if (!"AVAILABLE".equals(scooter.getStatus())) {
            throw new RuntimeException("Xe này hiện không khả dụng để thuê!");
        }

        scooter.setStatus("IN_USE");
        scooterRepository.save(scooter);

        Rental rental = new Rental(user, scooter);
        Rental savedRental = rentalRepository.save(rental);

        return mapToDTO(savedRental);
    }

    @Transactional
    public RentalResponseDTO endRental(Integer rentalId) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chuyến đi"));

        if ("COMPLETED".equals(rental.getStatus()))
            throw new RuntimeException("Chuyến đi này đã được thanh toán rồi!");

        rental.setEndTime(LocalDateTime.now());
        long minutes = Duration.between(rental.getStartTime(), rental.getEndTime()).toMinutes();

        if (minutes < 1) minutes = 1;
        rental.setTotalPrice(minutes * 1000.0);
        rental.setStatus("COMPLETED");

        Scooter scooter = rental.getScooter();
        scooter.setStatus("AVAILABLE");
        scooterRepository.save(scooter);

        Rental savedRental = rentalRepository.save(rental);
        return mapToDTO(savedRental);
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