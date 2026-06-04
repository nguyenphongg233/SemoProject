package com.semo.backend.controller;

import com.semo.backend.dto.TransactionResponseDTO;
import com.semo.backend.service.TransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
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
}