package com.semo.backend.service;

import com.semo.backend.dto.RentalRequestDTO;
import com.semo.backend.dto.RentalResponseDTO;
import com.semo.backend.entity.Rental;
import com.semo.backend.entity.Scooter;
import com.semo.backend.entity.Transaction;
import com.semo.backend.entity.User;
import com.semo.backend.repository.RentalRepository;
import com.semo.backend.repository.ScooterRepository;
import com.semo.backend.repository.UserRepository;
import com.semo.backend.repository.TransactionRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class RentalService {

    private final RentalRepository rentalRepository;
    private final ScooterRepository scooterRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private static final List<String> VALID_STATUSES = List.of("ALL", "ACTIVE", "COMPLETED");

    public RentalService(RentalRepository rentalRepository, ScooterRepository scooterRepository,
                         UserRepository userRepository, TransactionRepository transactionRepository) {
        this.rentalRepository = rentalRepository;
        this.scooterRepository = scooterRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public RentalResponseDTO startRental(RentalRequestDTO requestDTO) {
        User user = requireActiveAuthenticatedUser();

        Scooter scooter = scooterRepository.findById(requestDTO.getScooterId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Xe"));

        if (!"ADMIN".equals(user.getRole())) {
            if (user.getBalance() < 0) {
                throw new RuntimeException("Tài khoản của bạn đang có dư nợ (" + user.getBalance() + " VNĐ). Vui lòng nạp tiền để thanh toán nợ trước khi thuê chuyến mới!");
            }

            if (user.getBalance() < 50000.0) {
                throw new RuntimeException("Số dư tài khoản không đủ. Vui lòng đảm bảo trong ví có ít nhất 50.000 VNĐ để đặt cọc.");
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
    public RentalResponseDTO endRental(Integer rentalId) {
        User loggedInUser = requireActiveAuthenticatedUser();

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

        scooter.setStatus("AVAILABLE");

        if (!"ADMIN".equals(rentalOwner.getRole())) {
            rentalOwner.subtractBalance(amount - 50000.0);

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
        User user = requireActiveAuthenticatedUser();

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
        dto.setUserName(rental.getUser().getFullName() != null ? rental.getUser().getFullName() : rental.getUser().getEmail());
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

    private User requireActiveAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new RuntimeException("Truy cập bị từ chối: Vui lòng đăng nhập lại!");
        }

        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hệ thống"));

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new RuntimeException("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên!");
        }

        return user;
    }
}
