package com.semo.backend.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.semo.backend.dto.RentalRequestDTO;
import com.semo.backend.dto.RentalResponseDTO;
import com.semo.backend.entity.Rental;
import com.semo.backend.entity.Scooter;
import com.semo.backend.entity.Transaction;
import com.semo.backend.entity.User;
import com.semo.backend.repository.RentalRepository;
import com.semo.backend.repository.ScooterRepository;
import com.semo.backend.repository.SystemConfigRepository;
import com.semo.backend.repository.TransactionRepository;
import com.semo.backend.util.AuthUtil;

@Service
public class RentalService {

    private final RentalRepository rentalRepository;
    private final ScooterRepository scooterRepository;
    private final TransactionRepository transactionRepository;
    private final SystemConfigRepository configRepository;
    private final AuthUtil authUtil;
    private static final List<String> VALID_STATUSES = List.of("ALL", "IN_USE", "COMPLETED");

    public RentalService(RentalRepository rentalRepository, ScooterRepository scooterRepository,
            TransactionRepository transactionRepository,
            SystemConfigRepository configRepository,
            AuthUtil authUtil) {
        this.rentalRepository = rentalRepository;
        this.scooterRepository = scooterRepository;
        this.transactionRepository = transactionRepository;
        this.configRepository = configRepository;
        this.authUtil = authUtil;
    }

    private double getConfig(String key, double defaultValue) {
        return configRepository.findById(key)
                .map(c -> {
                    try {
                        return Double.parseDouble(c.getConfigValue());
                    } catch (NumberFormatException e) {
                        return defaultValue;
                    }
                })
                .orElse(defaultValue);
    }

    @Transactional
    public RentalResponseDTO startRental(RentalRequestDTO requestDTO) {
        User user = authUtil.requireActiveAuthenticatedUser();

        if (requestDTO.getScooterId() == null) throw new IllegalArgumentException("Invalid scooter ID");
        Scooter scooter = scooterRepository.findById(java.util.Objects.requireNonNull(requestDTO.getScooterId()))
                .orElseThrow(() -> new RuntimeException("Scooter not found"));

        if (!"ADMIN".equals(user.getRole())) {
            double minBalance = getConfig("MIN_BALANCE", 20000.0);
            double depositFee = getConfig("DEPOSIT_FEE", 50000.0);

            if (user.getBalance() < 0) {
                throw new RuntimeException("Your account has an outstanding debt (" + user.getBalance()
                        + " VND). Please top up to pay debt before renting a new ride!");
            }

            if (user.getBalance() < minBalance) {
                throw new RuntimeException("Minimum wallet balance to rent a scooter is " + minBalance + " VND.");
            }

            if (user.getBalance() < depositFee) {
                throw new RuntimeException(
                        "Insufficient account balance. Please ensure wallet has at least " + depositFee + " VND for deposit.");
            }
        }

        if (!"AVAILABLE".equals(scooter.getStatus())) {
            throw new RuntimeException("This scooter is currently not available for rent!");
        }

        scooter.setStatus("IN_USE");

        Rental rental = new Rental(user, scooter);
        rental.setStartLat(scooter.getCurrentLat());
        rental.setStartLng(scooter.getCurrentLng());

        rental = rentalRepository.save(rental);

        if (!"ADMIN".equals(user.getRole())) {
            double depositFee = getConfig("DEPOSIT_FEE", 50000.0);
            user.subtractBalance(depositFee);

            Transaction tx = new Transaction();
            tx.setUser(user);
            tx.setAmount(-depositFee);
            tx.setType("RENTAL_DEPOSIT");
            tx.setDescription("Deducted deposit for starting ride #" + rental.getId());
            transactionRepository.save(tx);
        }

        return mapToDTO(rental);
    }

    @Transactional
    public RentalResponseDTO endRental(@NonNull Integer rentalId) {
        User loggedInUser = authUtil.requireActiveAuthenticatedUser();

        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        User rentalOwner = rental.getUser();

        if (!rentalOwner.getId().equals(loggedInUser.getId()) && !"ADMIN".equals(loggedInUser.getRole())) {
            throw new RuntimeException("Security error: You do not have permission to end someone else's ride!");
        }

        return executeEndRentalLogic(rental, rentalOwner);
    }

    @Transactional
    public RentalResponseDTO forceEndRental(@NonNull Integer rentalId) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));
        return executeEndRentalLogic(rental, rental.getUser());
    }

    private RentalResponseDTO executeEndRentalLogic(Rental rental, User rentalOwner) {
        if ("COMPLETED".equals(rental.getStatus()))
            throw new RuntimeException("This ride has already been paid for!");

        Scooter scooter = rental.getScooter();

        rental.setEndTime(LocalDateTime.now());
        rental.setEndLat(scooter.getCurrentLat());
        rental.setEndLng(scooter.getCurrentLng());

        long minutes = Duration.between(rental.getStartTime(), rental.getEndTime()).toMinutes();
        if (minutes < 1)
            minutes = 1;

        double basePrice = getConfig("BASE_PRICE", 5000.0);
        double unlockFee = getConfig("UNLOCK_FEE", 10000.0);
        double discountRate = getConfig("DISCOUNT_RATE", 0.0);

        double amount = unlockFee + (minutes * basePrice);
        if (discountRate > 0) {
            amount = amount * (1.0 - discountRate);
        }

        if ("ADMIN".equals(rentalOwner.getRole()))
            amount = 0.0;

        rental.setTotalPrice(amount);
        rental.setStatus("COMPLETED");

        if (!"MAINTENANCE".equals(scooter.getStatus())) {
            scooter.setStatus("AVAILABLE");
        }

        if (!"ADMIN".equals(rentalOwner.getRole())) {
            double depositFee = getConfig("DEPOSIT_FEE", 50000.0);
            double diff = amount - depositFee;
            
            if (diff > 0) {
                rentalOwner.subtractBalance(diff);
            } else if (diff < 0) {
                rentalOwner.addBalance(-diff);
            }

            Transaction refundTx = new Transaction();
            refundTx.setUser(rentalOwner);
            refundTx.setAmount(depositFee);
            refundTx.setType("RENTAL_REFUND");
            refundTx.setDescription("Refunded deposit for ride #" + rental.getId());
            transactionRepository.save(refundTx);

            Transaction paymentTx = new Transaction();
            paymentTx.setUser(rentalOwner);
            paymentTx.setAmount(-amount);
            paymentTx.setType("RENTAL_PAYMENT");
            paymentTx.setDescription("Paid rental fee for ride #" + rental.getId());
            transactionRepository.save(paymentTx);
        }

        return mapToDTO(rental);
    }

    @Transactional(readOnly = true)
    public List<RentalResponseDTO> getRentalHistory(String status) {
        status = (status == null || status.isBlank()) ? "ALL" : status.trim().toUpperCase();
        if (!VALID_STATUSES.contains(status)) {
            throw new RuntimeException("Invalid state!");
        }
        User user = authUtil.requireActiveAuthenticatedUser();

        boolean isAdmin = "ADMIN".equals(user.getRole()),
                isAllStatus = "ALL".equals(status);

        List<Rental> rentals;

        if (isAdmin) {
            rentals = isAllStatus ? rentalRepository.findAllByOrderByStartTimeDesc()
                    : rentalRepository.findByStatusOrderByStartTimeDesc(status);
        } else {
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
        dto.setUserName(
                rental.getUser().getFullName() != null ? rental.getUser().getFullName() : rental.getUser().getEmail());
        dto.setScooterId(rental.getScooter().getId());
        dto.setStartTime(rental.getStartTime());
        dto.setEndTime(rental.getEndTime());
        dto.setTotalPrice(rental.getTotalPrice());
        dto.setStatus(rental.getStatus());
        dto.setStartLat(rental.getStartLat());
        dto.setStartLng(rental.getStartLng());
        dto.setEndLat(rental.getEndLat());
        dto.setEndLng(rental.getEndLng());
        return dto;
    }

    public void forceEndAllRentals() {
        authUtil.requireAdminAccess("Permission denied: Only Administrators can use this feature!");
        List<Rental> activeRentals = new java.util.ArrayList<>(rentalRepository.findByStatusOrderByStartTimeDesc("IN_USE"));
        activeRentals.addAll(rentalRepository.findByStatusOrderByStartTimeDesc("ACTIVE"));
        for (Rental rental : activeRentals) {
            try {
                endRental(rental.getId());
            } catch (Exception e) {
                System.err.println("Error force ending ride #" + rental.getId() + ": " + e.getMessage());
            }
        }
    }
}
