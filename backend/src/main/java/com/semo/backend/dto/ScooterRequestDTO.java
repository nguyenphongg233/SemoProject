package com.semo.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ScooterRequestDTO {

    @NotBlank(message = "Tên/Mã xe không được để trống")
    private String name;

    @NotNull(message = "Mức pin không được để trống")
    @Min(value = 0, message = "Mức pin không được nhỏ hơn 0")
    @Max(value = 100, message = "Mức pin không được lớn hơn 100")
    private Integer batteryLevel;

    @NotBlank(message = "Trạng thái xe không được để trống")
    private String status; // AVAILABLE, IN_USE, MAINTENANCE

    // Constructors
    public ScooterRequestDTO() {}

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
}