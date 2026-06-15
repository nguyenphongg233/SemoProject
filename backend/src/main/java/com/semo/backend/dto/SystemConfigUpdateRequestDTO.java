package com.semo.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class SystemConfigUpdateRequestDTO {
    @NotBlank(message = "Config Value không được để trống")
    private String value;

    private String description;

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
