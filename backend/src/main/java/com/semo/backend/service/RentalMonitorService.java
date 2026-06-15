package com.semo.backend.service;

import com.semo.backend.entity.Rental;
import com.semo.backend.entity.User;
import com.semo.backend.repository.RentalRepository;
import com.semo.backend.repository.SystemConfigRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class RentalMonitorService {

    private final RentalRepository rentalRepository;
    private final SystemConfigRepository configRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final RentalService rentalService;

    public RentalMonitorService(RentalRepository rentalRepository,
                                SystemConfigRepository configRepository,
                                SimpMessagingTemplate messagingTemplate,
                                RentalService rentalService) {
        this.rentalRepository = rentalRepository;
        this.configRepository = configRepository;
        this.messagingTemplate = messagingTemplate;
        this.rentalService = rentalService;
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

    @Scheduled(fixedRate = 5000)
    @Transactional
    public void monitorActiveRentals() {
        List<Rental> activeRentals = rentalRepository.findByStatusOrderByStartTimeDesc("IN_USE");
        if (activeRentals.isEmpty()) return;

        double discountRate = getConfig("DISCOUNT_RATE", 0.0);
        double basePrice = getConfig("BASE_PRICE", 5000.0);
        double unlockFee = getConfig("UNLOCK_FEE", 10000.0);
        double depositFee = getConfig("DEPOSIT_FEE", 50000.0);

        for (Rental rental : activeRentals) {
            User user = rental.getUser();
            if ("ADMIN".equals(user.getRole())) continue;

            double availableFunds = user.getBalance() + depositFee;

            double effectiveDiscount = 1.0 - discountRate;
            if (effectiveDiscount <= 0) effectiveDiscount = 1.0;
            
            double maxMinutesDouble = ((availableFunds / effectiveDiscount) - unlockFee) / basePrice;
            if (maxMinutesDouble < 1) maxMinutesDouble = 1;
            
            long maxMinutes = (long) Math.floor(maxMinutesDouble);
            long maxAllowedSeconds = (maxMinutes + 1) * 60 - 1;

            long elapsedSeconds = Duration.between(rental.getStartTime(), LocalDateTime.now()).getSeconds();
            long remainingSeconds = maxAllowedSeconds - elapsedSeconds;

            if (remainingSeconds <= 0) {
                try {
                    rentalService.forceEndRental(rental.getId());
                    messagingTemplate.convertAndSend("/topic/rentals/" + rental.getId(), "FORCE_END");
                } catch (Exception e) {
                    System.err.println("Failed to force end rental " + rental.getId() + ": " + e.getMessage());
                }
            } else if (remainingSeconds <= 10) {
                messagingTemplate.convertAndSend("/topic/rentals/" + rental.getId(), "COUNTDOWN:" + remainingSeconds);
            } else if (remainingSeconds <= 300) {
                messagingTemplate.convertAndSend("/topic/rentals/" + rental.getId(), "WARNING:" + remainingSeconds);
            }
        }
    }
}
