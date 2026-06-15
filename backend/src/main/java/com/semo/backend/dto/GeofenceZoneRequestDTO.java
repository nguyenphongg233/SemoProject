package com.semo.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class GeofenceZoneRequestDTO {

    @NotBlank(message = "Zone name cannot be empty")
    private String name;

    @NotNull(message = "Center latitude cannot be empty")
    private Double centerLat;

    @NotNull(message = "Center longitude cannot be empty")
    private Double centerLng;

    @NotNull(message = "Radius cannot be empty")
    @Min(value = 0, message = "Radius must be greater than 0")
    private Double radiusKm;

    public GeofenceZoneRequestDTO() {}

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getCenterLat() {
        return centerLat;
    }

    public void setCenterLat(Double centerLat) {
        this.centerLat = centerLat;
    }

    public Double getCenterLng() {
        return centerLng;
    }

    public void setCenterLng(Double centerLng) {
        this.centerLng = centerLng;
    }

    public Double getRadiusKm() {
        return radiusKm;
    }

    public void setRadiusKm(Double radiusKm) {
        this.radiusKm = radiusKm;
    }
}