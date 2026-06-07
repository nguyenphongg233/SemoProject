package com.semo.backend.service;

import com.semo.backend.dto.TransactionResponseDTO;
import com.semo.backend.entity.Transaction;
import com.semo.backend.entity.User;
import com.semo.backend.repository.TransactionRepository;
import com.semo.backend.repository.UserRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public TransactionService(TransactionRepository transactionRepository, UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<TransactionResponseDTO> getMyTransactionHistory() {
        User user = requireAuthenticatedUser();
        List<Transaction> transactions = transactionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return transactions.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TransactionResponseDTO> getAllTransactions() {
        requireAdminAccess();

        List<Transaction> transactions = transactionRepository.findByOrderByCreatedAtDesc();
        return transactions.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TransactionResponseDTO> getTransactionsByUserId(Integer userId) {
        requireAdminAccess();

        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));

        List<Transaction> transactions = transactionRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return transactions.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    private User requireAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new RuntimeException("Truy cập bị từ chối: Vui lòng đăng nhập lại!");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hệ thống"));
    }

    private void requireAdminAccess() {
        User user = requireAuthenticatedUser();
        if (!"ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Lỗi phân quyền: Chỉ Quản trị viên mới được dùng tính năng này!");
        }
    }

    private TransactionResponseDTO mapToDTO(Transaction transaction) {
        TransactionResponseDTO dto = new TransactionResponseDTO();
        dto.setId(transaction.getId());
        dto.setAmount(transaction.getAmount());
        dto.setType(transaction.getType());
        dto.setDescription(transaction.getDescription());
        dto.setCreatedAt(transaction.getCreatedAt());
        if (transaction.getUser() != null) {
            dto.setUserId(transaction.getUser().getId());
            dto.setUserName(transaction.getUser().getFullName() != null ? transaction.getUser().getFullName() : transaction.getUser().getEmail());
        }
        return dto;
    }
}