package com.semo.backend.controller;

import com.semo.backend.dto.TransactionResponseDTO;
import com.semo.backend.service.TransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    // Khách hàng gọi API này để xem biến động số dư của mình
    @GetMapping("/history")
    public ResponseEntity<List<TransactionResponseDTO>> getMyTransactionHistory() {
        List<TransactionResponseDTO> history = transactionService.getMyTransactionHistory();
        return ResponseEntity.ok(history);
    }

    @GetMapping("/all")
    public ResponseEntity<List<TransactionResponseDTO>> getAllTransactions() {
        List<TransactionResponseDTO> history = transactionService.getAllTransactions();
        return ResponseEntity.ok(history);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TransactionResponseDTO>> getTransactionsByUserId(@PathVariable Integer userId) {
        List<TransactionResponseDTO> history = transactionService.getTransactionsByUserId(userId);
        return ResponseEntity.ok(history);
    }
}