package com.semo.backend.dto;

import jakarta.validation.constraints.NotNull;

public class RentalRequestDTO {
    @NotNull(message = "Thiếu thông tin người thuê")
    private Integer userId;

    @NotNull(message = "Thiếu thông tin xe")
    private Integer scooterId;

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public Integer getScooterId() { return scooterId; }
    public void setScooterId(Integer scooterId) { this.scooterId = scooterId; }
}
