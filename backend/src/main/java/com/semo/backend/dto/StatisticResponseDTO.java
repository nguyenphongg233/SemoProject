package com.semo.backend.dto;

public class StatisticResponseDTO {

    private Double totalRevenue;
    private Long totalCompletedRentals;
    private Long activeRentals;
    private Long availableScooters;
    private Long maintenanceScooters;

    public StatisticResponseDTO() {
    }

    public Double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(Double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public Long getTotalCompletedRentals() {
        return totalCompletedRentals;
    }

    public void setTotalCompletedRentals(Long totalCompletedRentals) {
        this.totalCompletedRentals = totalCompletedRentals;
    }

    public Long getActiveRentals() {
        return activeRentals;
    }

    public void setActiveRentals(Long activeRentals) {
        this.activeRentals = activeRentals;
    }

    public Long getAvailableScooters() {
        return availableScooters;
    }

    public void setAvailableScooters(Long availableScooters) {
        this.availableScooters = availableScooters;
    }

    public Long getMaintenanceScooters() {
        return maintenanceScooters;
    }

    public void setMaintenanceScooters(Long maintenanceScooters) {
        this.maintenanceScooters = maintenanceScooters;
    }
}