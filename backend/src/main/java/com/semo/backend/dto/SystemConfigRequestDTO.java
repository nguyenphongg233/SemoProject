package com.semo.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class SystemConfigRequestDTO {

    @NotBlank(message = "Config Key không được để trống")
    private String key;

    @NotBlank(message = "Config Value không được để trống")
    private String value;

    private String description;

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

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