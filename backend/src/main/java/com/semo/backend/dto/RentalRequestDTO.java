package com.semo.backend.dto;

import jakarta.validation.constraints.NotNull;

public class RentalRequestDTO {
    @NotNull(message = "Missing scooter information")
    private Integer scooterId;

    public Integer getScooterId() { return scooterId; }
    public void setScooterId(Integer scooterId) { this.scooterId = scooterId; }
}
