package com.semo.backend.service;

import com.semo.backend.dto.PointDTO;
import com.semo.backend.entity.Rental;
import com.semo.backend.repository.RentalRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

import org.tribuo.MutableDataset;
import org.tribuo.clustering.ClusterID;
import org.tribuo.clustering.ClusteringFactory;
import org.tribuo.clustering.hdbscan.HdbscanTrainer;
import org.tribuo.clustering.hdbscan.HdbscanModel;
import org.tribuo.impl.ArrayExample;
import org.tribuo.provenance.SimpleDataSourceProvenance;

@Service
public class AnalyticsService {

    private final RentalRepository rentalRepository;

    public AnalyticsService(RentalRepository rentalRepository) {
        this.rentalRepository = rentalRepository;
    }

    public List<PointDTO> calculateOptimalChargingStations(int k) {
        if (k <= 0)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số lượng trạm sạc (K) phải lớn hơn 0.");
        
        List <Rental> rentals = rentalRepository.findByStatusOrderByStartTimeDesc("COMPLETED").stream()
                .filter(r -> r.getEndLat() != null && r.getEndLng() != null)
                .toList();

        if (rentals.isEmpty())
            return new ArrayList<>();
        if (k > rentals.size())
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Số lượng trạm sạc (K=" + k + ") không được lớn hơn tổng số xe hiện có ("
                    + rentals.size() + " xe)."
            );

        List<PointDTO> centroids = new ArrayList<>();
        List<Rental> shuffledRentals = new ArrayList<>(rentals);
        Collections.shuffle(shuffledRentals);
        for (int i = 0; i < k; i++) {
            Rental selectedRental = shuffledRentals.get(i);
            centroids.add(new PointDTO(selectedRental.getEndLat(), selectedRental.getEndLng()));
        }

        boolean isChanged = true;
        int maxIterations = 100;

        while (isChanged && maxIterations > 0) {
            isChanged = false;
            maxIterations--;

            double[] sumLat = new double[k];
            double[] sumLng = new double[k];
            int[] counts = new int[k];

            for (Rental rental : rentals) {
                int nearestCentroidIndex = findNearestCentroid(rental, centroids);
                sumLat[nearestCentroidIndex] += rental.getEndLat();
                sumLng[nearestCentroidIndex] += rental.getEndLng();
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

    private int findNearestCentroid(Rental rental, List<PointDTO> centroids) {
        int minIndex = 0;
        double minDistance = Double.MAX_VALUE;

        for (int i = 0; i < centroids.size(); i++) {
            PointDTO centroid = centroids.get(i);
            double distance = Math.pow(rental.getEndLat() - centroid.getLat(), 2)
                    + Math.pow(rental.getEndLng() - centroid.getLng(), 2);
            if (distance < minDistance) {
                minDistance = distance;
                minIndex = i;
            }
        }
        return minIndex;
    }

    public List<PointDTO> calculateOptimalChargingStationsHDBSCAN(int minClusterSize) {
        if (minClusterSize <= 0)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tham số minClusterSize phải lớn hơn 0.");

        List<Rental> rentals = rentalRepository.findByStatusOrderByStartTimeDesc("COMPLETED").stream()
                .filter(r -> r.getEndLat() != null && r.getEndLng() != null)
                .toList();

        if (rentals.isEmpty())
            return new ArrayList<>();
        if (minClusterSize > rentals.size())
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "minClusterSize (" + minClusterSize + ") không được lớn hơn tổng số xe hiện có (" + rentals.size() + " xe)."
            );

        SimpleDataSourceProvenance prov = new SimpleDataSourceProvenance("HDBSCAN", new ClusteringFactory());
        MutableDataset<ClusterID> dataset = new MutableDataset<ClusterID>(prov, new ClusteringFactory());
        String[] featureNames = new String[]{"lat", "lng"};
        for (Rental r : rentals) {
            dataset.add(new ArrayExample<ClusterID>(new ClusterID(ClusterID.UNASSIGNED), featureNames, new double[]{r.getEndLat(), r.getEndLng()}));
        }

        HdbscanTrainer trainer = new HdbscanTrainer(minClusterSize, HdbscanTrainer.Distance.EUCLIDEAN, minClusterSize, 1);
        HdbscanModel model = trainer.train(dataset);

        List<Integer> labels = model.getClusterLabels();
        
        Map<Integer, double[]> clusterSums = new HashMap<>();
        for (int i = 0; i < labels.size(); i++) {
            int clusterId = labels.get(i);
            if (clusterId <= 0) {
                continue; 
            }
            clusterSums.putIfAbsent(clusterId, new double[]{0.0, 0.0, 0});
            double[] sums = clusterSums.get(clusterId);
            Rental r = rentals.get(i);
            sums[0] += r.getEndLat();
            sums[1] += r.getEndLng();
            sums[2] += 1.0;
        }

        List<PointDTO> centroids = new ArrayList<>();
        for (double[] sums : clusterSums.values()) {
            centroids.add(new PointDTO(sums[0] / sums[2], sums[1] / sums[2]));
        }

        return centroids;
    }
}