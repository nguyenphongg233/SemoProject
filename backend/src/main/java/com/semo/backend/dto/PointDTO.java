package com.semo.backend.dto;

public class PointDTO {
    private Double lat;
    private Double lng;

    public PointDTO(Double lat, Double lng) {
        this.lat = lat;
        this.lng = lng;
    }

    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }

    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }
}