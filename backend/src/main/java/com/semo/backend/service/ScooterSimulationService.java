package com.semo.backend.service;

import com.semo.backend.entity.GeofenceZone;
import com.semo.backend.entity.MaintenanceLog;
import com.semo.backend.entity.Scooter;
import com.semo.backend.repository.GeofenceZoneRepository;
import com.semo.backend.repository.MaintenanceLogRepository;
import com.semo.backend.repository.ScooterRepository;
import com.semo.backend.repository.SystemConfigRepository;
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
    private final SystemConfigRepository configRepository;
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
                                    GeofenceZoneRepository geofenceZoneRepository,
                                    SystemConfigRepository configRepository) {
        this.scooterRepository = scooterRepository;
        this.maintenanceLogRepository = maintenanceLogRepository;
        this.messagingTemplate = messagingTemplate;
        this.geofenceZoneRepository = geofenceZoneRepository;
        this.configRepository = configRepository;
    }

    private double getConfig(String key, double defaultValue) {
        return configRepository.findById(key)
                .map(c -> {
                    try {
                        return Double.parseDouble(c.getConfigValue());
                    } catch (NumberFormatException e) {
                        return defaultValue;
                    }
                })
                .orElse(defaultValue);
    }

    // @Scheduled(fixedRate = 5000) // Tạm thời tắt hẳn chức năng bot theo yêu cầu
    @Transactional
    public void simulateScooterData() {
        List<Scooter> activeScooters = scooterRepository.findByStatus("IN_USE");

        // Dọn dẹp lộ trình rác: Nếu xe không còn IN_USE (bị force end, bảo trì, hoặc người dùng đã trả)
        // thì xóa lộ trình ảo của xe đó đi để tránh "xe ma" auto running.
        activeRoutes.keySet().removeIf(sId -> activeScooters.stream().noneMatch(s -> s.getId().equals(sId)));

        if (activeScooters.isEmpty()) {
            return;
        }

        List<GeofenceZone> allowedZones = geofenceZoneRepository.findAll();
        double maintenanceThreshold = getConfig("MAINTENANCE_THRESHOLD", 20.0);

        for (Scooter scooter : activeScooters) {
            simulateMovementAndSensors(scooter);
            checkGeofencing(scooter, allowedZones);
            checkAutoMaintenance(scooter, maintenanceThreshold);
        }

        messagingTemplate.convertAndSend("/topic/scooters", activeScooters);
        System.out.println("Just updated and broadcast coordinates for " + activeScooters.size() + " scooters!");
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
            System.out.println("🚨 [GEOFENCING] Xe " + scooter.getName() + " (ID: " + scooter.getId() + ") IS LOST!");
            messagingTemplate.convertAndSend("/topic/alerts", "🚨 GEOFENCING WARNING: Scooter " + scooter.getName() + " is moving outside allowed boundaries!");

        }
    }

    private void checkAutoMaintenance(Scooter scooter, double maintenanceThreshold) {
        if ("MAINTENANCE".equals(scooter.getStatus())) {
            return;
        }

        if (scooter.getBatteryLevel() < maintenanceThreshold || scooter.getTemperature() > 60.0) {
            scooter.setStatus("MAINTENANCE");

            String reason = scooter.getBatteryLevel() < maintenanceThreshold ? "Out of Battery" : "Overheated";

            MaintenanceLog log = new MaintenanceLog(
                    "System auto-locked scooter due to " + reason,
                    0.0,
                    scooter
            );
            maintenanceLogRepository.save(log);

            messagingTemplate.convertAndSend("/topic/alerts", "🔧 MAINTENANCE WARNING: Scooter " + scooter.getName() + " was auto-locked due to " + reason + "!");
        }
    }
}