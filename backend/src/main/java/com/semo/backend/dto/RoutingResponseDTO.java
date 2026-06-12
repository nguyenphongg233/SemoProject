package com.semo.backend.dto;

import java.util.List;

public class RoutingResponseDTO {
    private double distance; // in meters
    private long time; // in milliseconds
    private List<double[]> points; // [lat, lng]
    
    public RoutingResponseDTO() {}
    
    public RoutingResponseDTO(double distance, long time, List<double[]> points) {
        this.distance = distance;
        this.time = time;
        this.points = points;
    }
    
    public double getDistance() { return distance; }
    public void setDistance(double distance) { this.distance = distance; }
    
    public long getTime() { return time; }
    public void setTime(long time) { this.time = time; }
    
    public List<double[]> getPoints() { return points; }
    public void setPoints(List<double[]> points) { this.points = points; }
}
