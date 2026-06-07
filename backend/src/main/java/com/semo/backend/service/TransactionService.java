package com.semo.backend.service;

import com.semo.backend.dto.TransactionResponseDTO;
import com.semo.backend.entity.Transaction;
import com.semo.backend.entity.User;
import com.semo.backend.repository.TransactionRepository;
import com.semo.backend.repository.UserRepository;
import com.semo.backend.util.AuthUtil;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final AuthUtil authUtil;

    public TransactionService(TransactionRepository transactionRepository, UserRepository userRepository,
            AuthUtil authUtil) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.authUtil = authUtil;
    }

    @Transactional(readOnly = true)
    public List<TransactionResponseDTO> getMyTransactionHistory() {
        User user = authUtil.requireAuthenticatedUser();
        List<Transaction> transactions = transactionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return transactions.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TransactionResponseDTO> getAllTransactions() {
        authUtil.requireAdminAccess("Lỗi phân quyền: Chỉ Quản trị viên mới được dùng tính năng này!");

        List<Transaction> transactions = transactionRepository.findByOrderByCreatedAtDesc();
        return transactions.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TransactionResponseDTO> getTransactionsByUserId(Integer userId) {
        authUtil.requireAdminAccess("Lỗi phân quyền: Chỉ Quản trị viên mới được dùng tính năng này!");

        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));

        List<Transaction> transactions = transactionRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return transactions.stream().map(this::mapToDTO).collect(Collectors.toList());
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