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
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new RuntimeException("Truy cập bị từ chối: Vui lòng đăng nhập lại!");
        }

        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hệ thống"));

        List<Transaction> transactions = transactionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        return transactions.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private TransactionResponseDTO mapToDTO(Transaction transaction) {
        TransactionResponseDTO dto = new TransactionResponseDTO();
        dto.setId(transaction.getId());
        dto.setAmount(transaction.getAmount());
        dto.setType(transaction.getType());
        dto.setDescription(transaction.getDescription());
        dto.setCreatedAt(transaction.getCreatedAt());
        return dto;
    }
}