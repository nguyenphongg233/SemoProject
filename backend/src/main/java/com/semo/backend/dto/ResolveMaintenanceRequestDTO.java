package com.semo.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class ResolveMaintenanceRequestDTO {

    @NotNull(message = "Please enter the final repair cost")
    @Min(value = 0, message = "Cost cannot be negative")
    private Double cost;

    public Double getCost() {
        return cost;
    }

    public void setCost(Double cost) {
        this.cost = cost;
    }
}