package com.semo.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class MaintenanceLogRequestDTO {

    @NotNull(message = "ID xe không được để trống")
    private Integer scooterId;

    @NotBlank(message = "Mô tả lỗi không được để trống")
    private String description;

    @NotNull(message = "Chi phí sửa không được để trống")
    @Min(value = 0, message = "Chi phí không được là số âm")
    private Double cost;

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

    public Double getCost() {
        return cost;
    }

    public void setCost(Double cost) {
        this.cost = cost;
    }
}
