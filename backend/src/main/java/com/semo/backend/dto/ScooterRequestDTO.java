package com.semo.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ScooterRequestDTO {

    @NotBlank(message = "Scooter Name/Code cannot be empty")
    private String name;

    @NotNull(message = "Battery level cannot be empty")
    @Min(value = 0, message = "Battery level cannot be less than 0")
    @Max(value = 100, message = "Battery level cannot be greater than 100")
    private Integer batteryLevel;

    @NotBlank(message = "Scooter status cannot be empty")
    private String status; // AVAILABLE, IN_USE, MAINTENANCE

    private Double currentLat;
    private Double currentLng;

    // Constructors
    public ScooterRequestDTO() {
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getBatteryLevel() {
        return batteryLevel;
    }

    public void setBatteryLevel(Integer batteryLevel) {
        this.batteryLevel = batteryLevel;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getCurrentLat() {
        return currentLat;
    }

    public void setCurrentLat(Double currentLat) {
        this.currentLat = currentLat;
    }

    public Double getCurrentLng() {
        return currentLng;
    }

    public void setCurrentLng(Double currentLng) {
        this.currentLng = currentLng;
    }
}