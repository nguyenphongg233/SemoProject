package com.semo.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class SystemConfigRequestDTO {

    @NotBlank(message = "Config Key cannot be empty")
    private String key;

    @NotBlank(message = "Config Value cannot be empty")
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