package com.semo.backend.dto;

import java.time.LocalDateTime;

public class StationResponseDTO {
    private Integer id;
    private String name;
    private Double lat;
    private Double lng;
    private Integer capacity;
    private String status;
    private Long availableScootersCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public StationResponseDTO() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    
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
    
    public Long getAvailableScootersCount() { return availableScootersCount; }
    public void setAvailableScootersCount(Long availableScootersCount) { this.availableScootersCount = availableScootersCount; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
