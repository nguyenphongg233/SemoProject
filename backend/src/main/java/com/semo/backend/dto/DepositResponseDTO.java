package com.semo.backend.dto;

public class DepositResponseDTO {
    private String message;
    private Double newBalance;

    public DepositResponseDTO(String message, Double newBalance) {
        this.message = message;
        this.newBalance = newBalance;
    }

    public String getMessage() {
        return message;
    }

    public Double getNewBalance() {
        return newBalance;
    }
}