package com.semo.backend.util;

public class GeoUtils {

    private static final double EARTH_RADIUS_KM = 6371.0;

    /**
     * Thuật toán Haversine: Tính khoảng cách đường chim bay giữa 2 tọa độ GPS.
     * @return Khoảng cách tính bằng Kilomet (km)
     */
    public static double calculateDistance(double startLat, double startLng, double endLat, double endLng) {
        double dLat = Math.toRadians(endLat - startLat);
        double dLng = Math.toRadians(endLng - startLng);

        double originLat = Math.toRadians(startLat);
        double destinationLat = Math.toRadians(endLat);

        double a = Math.pow(Math.sin(dLat / 2), 2) +
                Math.pow(Math.sin(dLng / 2), 2) * Math.cos(originLat) * Math.cos(destinationLat);

        double c = 2 * Math.asin(Math.sqrt(a));

        return EARTH_RADIUS_KM * c;
    }
}