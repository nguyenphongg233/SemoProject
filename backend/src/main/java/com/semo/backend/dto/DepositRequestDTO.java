package com.semo.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class DepositRequestDTO {

    @NotNull(message = "Deposit amount cannot be empty")
    @Min(value = 10000, message = "Minimum deposit amount is 10,000 VND")
    private Double amount;

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }
}