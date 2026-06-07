package com.semo.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class GeofenceZoneRequestDTO {

    @NotBlank(message = "Tên khu vực không được để trống")
    private String name;

    @NotNull(message = "Vĩ độ tâm không được để trống")
    private Double centerLat;

    @NotNull(message = "Kinh độ tâm không được để trống")
    private Double centerLng;

    @NotNull(message = "Bán kính không được để trống")
    @Min(value = 0, message = "Bán kính phải lớn hơn 0")
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