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
import com.semo.backend.repository.TransactionRepository;
import com.semo.backend.util.AuthUtil;

@Service
public class RentalService {

    private final RentalRepository rentalRepository;
    private final ScooterRepository scooterRepository;
    private final TransactionRepository transactionRepository;
    private final AuthUtil authUtil;
    private static final List<String> VALID_STATUSES = List.of("ALL", "IN_USE", "COMPLETED");

    public RentalService(RentalRepository rentalRepository, ScooterRepository scooterRepository,
            TransactionRepository transactionRepository,
            AuthUtil authUtil) {
        this.rentalRepository = rentalRepository;
        this.scooterRepository = scooterRepository;
        this.transactionRepository = transactionRepository;
        this.authUtil = authUtil;
    }

    @Transactional
    public RentalResponseDTO startRental(RentalRequestDTO requestDTO) {
        User user = authUtil.requireActiveAuthenticatedUser();

        if (requestDTO.getScooterId() == null) throw new IllegalArgumentException("ID xe không hợp lệ");
        Scooter scooter = scooterRepository.findById(java.util.Objects.requireNonNull(requestDTO.getScooterId()))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Xe"));

        if (!"ADMIN".equals(user.getRole())) {
            if (user.getBalance() < 0) {
                throw new RuntimeException("Tài khoản của bạn đang có dư nợ (" + user.getBalance()
                        + " VNĐ). Vui lòng nạp tiền để thanh toán nợ trước khi thuê chuyến mới!");
            }

            if (user.getBalance() < 50000.0) {
                throw new RuntimeException(
                        "Số dư tài khoản không đủ. Vui lòng đảm bảo trong ví có ít nhất 50.000 VNĐ để đặt cọc.");
            }
        }

        if (!"AVAILABLE".equals(scooter.getStatus())) {
            throw new RuntimeException("Xe này hiện không khả dụng để thuê!");
        }

        scooter.setStatus("IN_USE");

        Rental rental = new Rental(user, scooter);
        rental.setStartLat(scooter.getCurrentLat());
        rental.setStartLng(scooter.getCurrentLng());

        rental = rentalRepository.save(rental);

        if (!"ADMIN".equals(user.getRole())) {
            user.subtractBalance(50000.0);

            Transaction tx = new Transaction();
            tx.setUser(user);
            tx.setAmount(-50000.0);
            tx.setType("RENTAL_DEPOSIT");
            tx.setDescription("Trừ tiền cọc bắt đầu chuyến đi #" + rental.getId());
            transactionRepository.save(tx);
        }

        return mapToDTO(rental);
    }

    @Transactional
    public RentalResponseDTO endRental(@NonNull Integer rentalId) {
        User loggedInUser = authUtil.requireActiveAuthenticatedUser();

        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chuyến đi"));

        User rentalOwner = rental.getUser();

        if (!rentalOwner.getId().equals(loggedInUser.getId()) && !"ADMIN".equals(loggedInUser.getRole())) {
            throw new RuntimeException("Lỗi bảo mật: Bạn không có quyền kết thúc chuyến đi của người khác!");
        }

        if ("COMPLETED".equals(rental.getStatus()))
            throw new RuntimeException("Chuyến đi này đã được thanh toán rồi!");

        Scooter scooter = rental.getScooter();

        rental.setEndTime(LocalDateTime.now());
        rental.setEndLat(scooter.getCurrentLat());
        rental.setEndLng(scooter.getCurrentLng());

        long minutes = Duration.between(rental.getStartTime(), rental.getEndTime()).toMinutes();
        if (minutes < 1)
            minutes = 1;

        double amount = minutes * 1000.0;
        if ("ADMIN".equals(rentalOwner.getRole()))
            amount = 0.0;

        rental.setTotalPrice(amount);
        rental.setStatus("COMPLETED");

        if (!"MAINTENANCE".equals(scooter.getStatus())) {
            scooter.setStatus("AVAILABLE");
        }

        if (!"ADMIN".equals(rentalOwner.getRole())) {
            double diff = amount - 50000.0;
            if (diff > 0) {
                rentalOwner.subtractBalance(diff);
            } else if (diff < 0) {
                rentalOwner.addBalance(-diff);
            }

            Transaction refundTx = new Transaction();
            refundTx.setUser(rentalOwner);
            refundTx.setAmount(50000.0);
            refundTx.setType("RENTAL_REFUND");
            refundTx.setDescription("Hoàn tiền cọc chuyến đi #" + rental.getId());
            transactionRepository.save(refundTx);

            Transaction paymentTx = new Transaction();
            paymentTx.setUser(rentalOwner);
            paymentTx.setAmount(-amount);
            paymentTx.setType("RENTAL_PAYMENT");
            paymentTx.setDescription("Thanh toán phí thuê xe cho chuyến đi #" + rental.getId());
            transactionRepository.save(paymentTx);
        }

        return mapToDTO(rental);
    }

    @Transactional(readOnly = true)
    public List<RentalResponseDTO> getRentalHistory(String status) {
        status = (status == null || status.isBlank()) ? "ALL" : status.trim().toUpperCase();
        if (!VALID_STATUSES.contains(status)) {
            throw new RuntimeException("Trạng thái không hợp lệ!");
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

    @Transactional
    public void forceEndAllRentals() {
        authUtil.requireAdminAccess("Lỗi phân quyền: Chỉ Quản trị viên mới được dùng tính năng này!");
        List<Rental> activeRentals = new java.util.ArrayList<>(rentalRepository.findByStatusOrderByStartTimeDesc("IN_USE"));
        activeRentals.addAll(rentalRepository.findByStatusOrderByStartTimeDesc("ACTIVE"));
        for (Rental rental : activeRentals) {
            try {
                endRental(rental.getId());
            } catch (Exception e) {
                System.err.println("Lỗi khi force end chuyến đi #" + rental.getId() + ": " + e.getMessage());
            }
        }
    }
}
