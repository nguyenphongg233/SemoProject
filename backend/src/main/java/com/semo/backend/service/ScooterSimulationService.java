package com.semo.backend.service;

import com.semo.backend.entity.MaintenanceLog;
import com.semo.backend.entity.Scooter;
import com.semo.backend.repository.MaintenanceLogRepository;
import com.semo.backend.repository.ScooterRepository;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;

@Service
public class ScooterSimulationService {

    private final ScooterRepository scooterRepository;
    private final MaintenanceLogRepository maintenanceLogRepository;

    private final SimpMessagingTemplate messagingTemplate;

    private final Random random = new Random();

    public ScooterSimulationService(ScooterRepository scooterRepository,
                                    MaintenanceLogRepository maintenanceLogRepository,
                                    SimpMessagingTemplate messagingTemplate) {
        this.scooterRepository = scooterRepository;
        this.maintenanceLogRepository = maintenanceLogRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Scheduled(fixedRate = 5000)
    @Transactional
    public void simulateScooterData() {
        List<Scooter> activeScooters = scooterRepository.findByStatus("IN_USE");

        if (activeScooters.isEmpty())
            return;

        for (Scooter scooter : activeScooters) {
            if(scooter.getCurrentLat() != null && scooter.getCurrentLng() != null) {
                scooter.setCurrentLat(scooter.getCurrentLat() + (random.nextDouble() - 0.5) * 0.0002);
                scooter.setCurrentLng(scooter.getCurrentLng() + (random.nextDouble() - 0.5) * 0.0002);
            }

            int batteryDrop = random.nextInt(2);
            scooter.setBatteryLevel(Math.max(0, scooter.getBatteryLevel() - batteryDrop));

            if(scooter.getTemperature() == null)
                scooter.setTemperature(35.0);
            scooter.setTemperature(scooter.getTemperature() + (random.nextDouble() * 2));

            if (scooter.getBatteryLevel() < 10 || scooter.getTemperature() > 60.0) {
                scooter.setStatus("MAINTENANCE");

                MaintenanceLog log = new MaintenanceLog(
                        "Hệ thống tự động khóa xe do " + (scooter.getBatteryLevel() < 10 ? "Hết Pin" : "Quá Nhiệt"),
                        0.0,
                        scooter
                );
                maintenanceLogRepository.save(log);

                messagingTemplate.convertAndSend("/topic/alerts", "CẢNH BÁO: Xe " + scooter.getName() + " đã bị khóa tự động!");
            }
        }

        scooterRepository.saveAll(activeScooters);

        messagingTemplate.convertAndSend("/topic/scooters", activeScooters);

        System.out.println("Vừa cập nhật và bắn tọa độ cho " + activeScooters.size() + " chiếc xe!");
    }
}