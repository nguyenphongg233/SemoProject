package com.semo.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class DepositRequestDTO {

    @NotNull(message = "Số tiền nạp không được để trống")
    @Min(value = 10000, message = "Số tiền nạp tối thiểu là 10.000 VNĐ")
    private Double amount;

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }
}