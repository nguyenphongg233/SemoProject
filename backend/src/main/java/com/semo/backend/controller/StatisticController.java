package com.semo.backend.controller;

import com.semo.backend.dto.StatisticResponseDTO;
import com.semo.backend.service.StatisticService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/statistics")
public class StatisticController {

    private final StatisticService statisticService;

    public StatisticController(StatisticService statisticService) {
        this.statisticService = statisticService;
    }

    // API Lấy dữ liệu tổng quan cho Admin Dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<StatisticResponseDTO> getDashboardStats() {
        StatisticResponseDTO stats = statisticService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }
}