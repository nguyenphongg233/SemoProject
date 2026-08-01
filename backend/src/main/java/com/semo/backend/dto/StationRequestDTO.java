package com.semo.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

public class StationRequestDTO {
    @NotBlank(message = "Station name cannot be empty")
    private String name;

    @NotNull(message = "Latitude cannot be empty")
    private Double lat;

    @NotNull(message = "Longitude cannot be empty")
    private Double lng;

    @NotNull(message = "Capacity cannot be empty")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    private String status; // ACTIVE, INACTIVE

    public StationRequestDTO() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }
    
    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }
    
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
