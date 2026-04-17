package com.semo.backend.dto;

import java.time.LocalDateTime;

public class RentalResponseDTO {
    private Integer id;
    private Integer userId;
    private Integer scooterId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Double totalPrice;
    private String status;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public Integer getScooterId() { return scooterId; }
    public void setScooterId(Integer scooterId) { this.scooterId = scooterId; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}