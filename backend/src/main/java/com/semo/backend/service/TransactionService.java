package com.semo.backend.service;

import com.semo.backend.dto.TransactionResponseDTO;
import com.semo.backend.entity.Transaction;
import com.semo.backend.entity.User;
import com.semo.backend.repository.TransactionRepository;
import com.semo.backend.repository.UserRepository;
import com.semo.backend.util.AuthUtil;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final AuthUtil authUtil;
    private final MailService mailService;

    public TransactionService(TransactionRepository transactionRepository, UserRepository userRepository,
            AuthUtil authUtil, MailService mailService) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.authUtil = authUtil;
        this.mailService = mailService;
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
    public List<TransactionResponseDTO> getTransactionsByUserId(@NonNull Integer userId) {
        authUtil.requireAdminAccess("Lỗi phân quyền: Chỉ Quản trị viên mới được dùng tính năng này!");

        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));

        List<Transaction> transactions = transactionRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return transactions.stream().map(this::mapToDTO).collect(Collectors.toList());
    }
    @Transactional
    public TransactionResponseDTO approveTransaction(@NonNull Integer id) {
        authUtil.requireAdminAccess("Lỗi phân quyền: Chỉ Quản trị viên mới được dùng tính năng này!");
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch"));
        
        if (!"PENDING".equals(transaction.getStatus())) {
            throw new RuntimeException("Chỉ có thể duyệt giao dịch ở trạng thái PENDING");
        }

        transaction.setStatus("COMPLETED");
        
        // Add balance to user
        User user = transaction.getUser();
        user.addBalance(transaction.getAmount());
        userRepository.save(user);

        // Gửi email thông báo
        if (user.getEmail() != null) {
            mailService.sendTransactionStatusEmail(user.getEmail(), "COMPLETED", transaction.getAmount());
        }

        return mapToDTO(transactionRepository.save(transaction));
    }

    @Transactional
    public TransactionResponseDTO rejectTransaction(@NonNull Integer id) {
        authUtil.requireAdminAccess("Lỗi phân quyền: Chỉ Quản trị viên mới được dùng tính năng này!");
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch"));
        
        if (!"PENDING".equals(transaction.getStatus())) {
            throw new RuntimeException("Chỉ có thể từ chối giao dịch ở trạng thái PENDING");
        }

        transaction.setStatus("REJECTED");
        
        User user = transaction.getUser();
        if (user != null && user.getEmail() != null) {
            mailService.sendTransactionStatusEmail(user.getEmail(), "REJECTED", transaction.getAmount());
        }

        return mapToDTO(transactionRepository.save(transaction));
    }


    private TransactionResponseDTO mapToDTO(Transaction transaction) {
        TransactionResponseDTO dto = new TransactionResponseDTO();
        dto.setId(transaction.getId());
        dto.setAmount(transaction.getAmount());
        dto.setType(transaction.getType());
        dto.setDescription(transaction.getDescription());
        dto.setStatus(transaction.getStatus());
        dto.setCreatedAt(transaction.getCreatedAt());
        if (transaction.getUser() != null) {
            dto.setUserId(transaction.getUser().getId());
            dto.setUserName(transaction.getUser().getFullName() != null ? transaction.getUser().getFullName() : transaction.getUser().getEmail());
        }
        return dto;
    }
}