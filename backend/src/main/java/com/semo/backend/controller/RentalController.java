package com.semo.backend.controller;

import com.semo.backend.dto.RentalRequestDTO;
import com.semo.backend.dto.RentalResponseDTO;
import com.semo.backend.service.RentalService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.lang.NonNull;

import java.util.List;

@RestController
@RequestMapping("/api/rentals")
public class RentalController {

    private final RentalService rentalService;

    public RentalController(RentalService rentalService) {
        this.rentalService = rentalService;
    }

    // 1. API Bắt đầu thuê xe
    @PostMapping("/start")
    public ResponseEntity<RentalResponseDTO> startRental(@Valid @RequestBody RentalRequestDTO requestDTO) {
        RentalResponseDTO responseDTO = rentalService.startRental(requestDTO);
        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }

    // 2. API Kết thúc thuê xe (Trả xe)
    @PutMapping("/{id}/end")
    public ResponseEntity<RentalResponseDTO> endRental(@PathVariable @NonNull Integer id) {
        RentalResponseDTO responseDTO = rentalService.endRental(id);
        return ResponseEntity.ok(responseDTO);
    }

    // 3. API Xem lịch sử chuyến đi cá nhân
    @GetMapping("/history")
    public ResponseEntity<List<RentalResponseDTO>> getHistory(String status) {
        List<RentalResponseDTO> history = rentalService.getRentalHistory(status);
        return ResponseEntity.ok(history);
    }
}
