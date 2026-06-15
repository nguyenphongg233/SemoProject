package com.semo.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class MaintenanceLogRequestDTO {

    @NotNull(message = "ID xe không được để trống")
    private Integer scooterId;

    @NotBlank(message = "Mô tả lỗi không được để trống")
    private String description;

    public MaintenanceLogRequestDTO() {
    }

    public Integer getScooterId() {
        return scooterId;
    }

    public void setScooterId(Integer scooterId) {
        this.scooterId = scooterId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
