package com.semo.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class ResolveMaintenanceRequestDTO {

    @NotNull(message = "Vui lòng nhập chi phí sửa chữa cuối cùng")
    @Min(value = 0, message = "Chi phí không được là số âm")
    private Double cost;

    public Double getCost() {
        return cost;
    }

    public void setCost(Double cost) {
        this.cost = cost;
    }
}