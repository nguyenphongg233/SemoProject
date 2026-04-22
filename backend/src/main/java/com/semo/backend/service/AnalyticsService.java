package com.semo.backend.service;

import com.semo.backend.dto.PointDTO;
import com.semo.backend.entity.Scooter;
import com.semo.backend.repository.ScooterRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class AnalyticsService {

    private final ScooterRepository scooterRepository;

    public AnalyticsService(ScooterRepository scooterRepository) {
        this.scooterRepository = scooterRepository;
    }

    public List<PointDTO> calculateOptimalChargingStations(int k) {
        if (k <= 0)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số lượng trạm sạc (K) phải lớn hơn 0.");
        
        List<Scooter> scooters = scooterRepository.findAll().stream()
                .filter(s -> s.getCurrentLat() != null && s.getCurrentLng() != null
                        && "AVAILABLE".equals(s.getStatus()))
                .toList();

        if (scooters.isEmpty())
            return new ArrayList<>();
        if (k > scooters.size())
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Số lượng trạm sạc (K=" + k + ") không được lớn hơn tổng số xe hiện có ("
                    + scooters.size() + " xe)."
            );

        List<PointDTO> centroids = new ArrayList<>();
        List<Scooter> shuffledScooters = new ArrayList<>(scooters);
        Collections.shuffle(shuffledScooters);
        for (int i = 0; i < k; i++) {
            Scooter selectedScooter = shuffledScooters.get(i);
            centroids.add(new PointDTO(selectedScooter.getCurrentLat(), selectedScooter.getCurrentLng()));
        }

        boolean isChanged = true;
        int maxIterations = 100;

        while (isChanged && maxIterations > 0) {
            isChanged = false;
            maxIterations--;

            double[] sumLat = new double[k];
            double[] sumLng = new double[k];
            int[] counts = new int[k];

            for (Scooter scooter : scooters) {
                int nearestCentroidIndex = findNearestCentroid(scooter, centroids);
                sumLat[nearestCentroidIndex] += scooter.getCurrentLat();
                sumLng[nearestCentroidIndex] += scooter.getCurrentLng();
                counts[nearestCentroidIndex]++;
            }

            for (int i = 0; i < k; i++) {
                if (counts[i] > 0) {
                    double newLat = sumLat[i] / counts[i];
                    double newLng = sumLng[i] / counts[i];

                    if (Math.abs(centroids.get(i).getLat() - newLat) > 0.0001 ||
                            Math.abs(centroids.get(i).getLng() - newLng) > 0.0001) {
                        isChanged = true;
                    }

                    centroids.get(i).setLat(newLat);
                    centroids.get(i).setLng(newLng);
                }
            }
        }
        return centroids;
    }

    private int findNearestCentroid(Scooter scooter, List<PointDTO> centroids) {
        int minIndex = 0;
        double minDistance = Double.MAX_VALUE;

        for (int i = 0; i < centroids.size(); i++) {
            PointDTO centroid = centroids.get(i);
            double distance = Math.pow(scooter.getCurrentLat() - centroid.getLat(), 2)
                    + Math.pow(scooter.getCurrentLng() - centroid.getLng(), 2);
            if (distance < minDistance) {
                minDistance = distance;
                minIndex = i;
            }
        }
        return minIndex;
    }
}