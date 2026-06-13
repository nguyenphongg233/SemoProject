package com.semo.backend.service;

import com.semo.backend.entity.GeofenceZone;
import com.semo.backend.entity.MaintenanceLog;
import com.semo.backend.entity.Scooter;
import com.semo.backend.repository.GeofenceZoneRepository;
import com.semo.backend.repository.MaintenanceLogRepository;
import com.semo.backend.repository.ScooterRepository;
import com.semo.backend.util.GeoUtils;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ScooterSimulationService {

    private final ScooterRepository scooterRepository;
    private final MaintenanceLogRepository maintenanceLogRepository;
    private final GeofenceZoneRepository geofenceZoneRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private final Random random = new Random();
    private final Map<Integer, List<double[]>> activeRoutes = new ConcurrentHashMap<>();

    public void assignRoute(Integer scooterId, List<double[]> path) {
        activeRoutes.put(scooterId, new ArrayList<>(path));
    }

    public boolean hasArrived(Integer scooterId) {
        return !activeRoutes.containsKey(scooterId);
    }

    public ScooterSimulationService(ScooterRepository scooterRepository,
                                    MaintenanceLogRepository maintenanceLogRepository,
                                    SimpMessagingTemplate messagingTemplate,
                                    GeofenceZoneRepository geofenceZoneRepository) {
        this.scooterRepository = scooterRepository;
        this.maintenanceLogRepository = maintenanceLogRepository;
        this.messagingTemplate = messagingTemplate;
        this.geofenceZoneRepository = geofenceZoneRepository;
    }

    @Scheduled(fixedRate = 5000)
    @Transactional
    public void simulateScooterData() {
        List<Scooter> activeScooters = scooterRepository.findByStatus("IN_USE");

        if (activeScooters.isEmpty()) {
            return;
        }

        List<GeofenceZone> allowedZones = geofenceZoneRepository.findAll();

        for (Scooter scooter : activeScooters) {
            simulateMovementAndSensors(scooter);
            checkGeofencing(scooter, allowedZones);
            checkAutoMaintenance(scooter);
        }

        messagingTemplate.convertAndSend("/topic/scooters", activeScooters);
        System.out.println("Vừa cập nhật và bắn tọa độ cho " + activeScooters.size() + " chiếc xe!");
    }

    private void simulateMovementAndSensors(Scooter scooter) {
        Integer sId = scooter.getId();
        if (activeRoutes.containsKey(sId)) {
            List<double[]> path = activeRoutes.get(sId);
            if (path.isEmpty()) {
                activeRoutes.remove(sId);
            } else {
                double[] target = path.get(0);
                double dLat = target[0] - scooter.getCurrentLat();
                double dLng = target[1] - scooter.getCurrentLng();
                double dist = Math.sqrt(dLat * dLat + dLng * dLng);
                double step = 0.0005; // speed per 5 seconds

                if (dist <= step) {
                    scooter.setCurrentLat(target[0]);
                    scooter.setCurrentLng(target[1]);
                    path.remove(0);
                    if (path.isEmpty()) {
                        activeRoutes.remove(sId);
                    }
                } else {
                    scooter.setCurrentLat(scooter.getCurrentLat() + (dLat / dist) * step);
                    scooter.setCurrentLng(scooter.getCurrentLng() + (dLng / dist) * step);
                }
            }
        }

        int batteryDrop = random.nextInt(2);
        scooter.setBatteryLevel(Math.max(0, scooter.getBatteryLevel() - batteryDrop));

        if (scooter.getTemperature() == null) {
            scooter.setTemperature(35.0);
        }
        scooter.setTemperature(scooter.getTemperature() + (random.nextDouble() * 2));
    }

    private void checkGeofencing(Scooter scooter, List<GeofenceZone> allowedZones) {
        if (scooter.getCurrentLat() == null || scooter.getCurrentLng() == null || allowedZones.isEmpty()) {
            return;
        }

        boolean isSafe = false;
        for (GeofenceZone zone : allowedZones) {
            double distance = GeoUtils.calculateDistance(
                    zone.getCenterLat(), zone.getCenterLng(),
                    scooter.getCurrentLat(), scooter.getCurrentLng()
            );

            if (distance <= zone.getRadiusKm()) {
                isSafe = true;
                break;
            }
        }

        if (!isSafe) {
            System.out.println("🚨 [GEOFENCING] Xe " + scooter.getName() + " (ID: " + scooter.getId() + ") ĐÃ ĐI LẠC!");
            messagingTemplate.convertAndSend("/topic/alerts", "🚨 CẢNH BÁO GEOFENCING: Xe " + scooter.getName() + " đang di chuyển ngoài ranh giới cho phép!");

        }
    }

    private void checkAutoMaintenance(Scooter scooter) {
        if ("MAINTENANCE".equals(scooter.getStatus())) {
            return;
        }

        if (scooter.getBatteryLevel() < 10 || scooter.getTemperature() > 60.0) {
            scooter.setStatus("MAINTENANCE");

            String reason = scooter.getBatteryLevel() < 10 ? "Hết Pin" : "Quá Nhiệt";

            MaintenanceLog log = new MaintenanceLog(
                    "Hệ thống tự động khóa xe do " + reason,
                    0.0,
                    scooter
            );
            maintenanceLogRepository.save(log);

            messagingTemplate.convertAndSend("/topic/alerts", "🔧 CẢNH BÁO BẢO TRÌ: Xe " + scooter.getName() + " đã bị khóa tự động do " + reason + "!");
        }
    }
}