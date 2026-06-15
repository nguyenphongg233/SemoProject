package com.semo.backend.service;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Random;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.semo.backend.dto.FeedbackRequestDTO;
import com.semo.backend.dto.RentalRequestDTO;
import com.semo.backend.dto.RoutingResponseDTO;
import com.semo.backend.entity.Rental;
import com.semo.backend.entity.Scooter;
import com.semo.backend.entity.Transaction;
import com.semo.backend.entity.User;
import com.semo.backend.repository.RentalRepository;
import com.semo.backend.repository.ScooterRepository;
import com.semo.backend.repository.TransactionRepository;
import com.semo.backend.repository.UserRepository;

@Service
public class UserSimulationService {

    private final UserRepository userRepository;
    private final ScooterRepository scooterRepository;
    private final RentalRepository rentalRepository;
    private final RentalService rentalService;
    private final FeedbackService feedbackService;
    private final TransactionRepository transactionRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final RoutingService routingService;
    private final ScooterSimulationService scooterSimulationService;
    
    private final Random random = new Random();
    
    private boolean botEnabled = false;

    public void setBotEnabled(boolean botEnabled) {
        this.botEnabled = botEnabled;
    }

    private final List<String> FEEDBACK_COMMENTS = Arrays.asList(
        "The ride was very smooth, thank you Semo!",
        "Great ride, the scooter is still new.",
        "Good service, affordable price.",
        "Easy to use app, will continue to support.",
        "Scooter is stable but battery drops a bit fast."
    );

    public UserSimulationService(UserRepository userRepository, ScooterRepository scooterRepository,
                                 RentalRepository rentalRepository, RentalService rentalService,
                                 FeedbackService feedbackService, TransactionRepository transactionRepository,
                                 SimpMessagingTemplate messagingTemplate, RoutingService routingService,
                                 ScooterSimulationService scooterSimulationService) {
        this.userRepository = userRepository;
        this.scooterRepository = scooterRepository;
        this.rentalRepository = rentalRepository;
        this.rentalService = rentalService;
        this.feedbackService = feedbackService;
        this.transactionRepository = transactionRepository;
        this.messagingTemplate = messagingTemplate;
        this.routingService = routingService;
        this.scooterSimulationService = scooterSimulationService;
    }

    // @Scheduled(fixedRate = 15000) // Temporarily disabled bot function as requested
    
    public void simulateBotBehaviors() {
        if (!botEnabled) return;

        // Get list of bots (marked by 'bot' in email and CUSTOMER role)
        List<User> bots = userRepository.findAll().stream()
                .filter(u -> u.getEmail().startsWith("bot") && "CUSTOMER".equals(u.getRole()))
                .toList();

        if (bots.isEmpty()) return;

        for (User bot : bots) {
            // Check if bot has any ongoing rides
            List<Rental> activeRentals = rentalRepository.findByUserAndStatusOrderByStartTimeDesc(bot, "IN_USE");

            try {
                mockAuthentication(bot);

                if (activeRentals.isEmpty()) {
                    // Scenario: No ride
                    // 1. Check balance, if less than 50,000 VND -> auto top up
                    if (bot.getBalance() < 50000.0) {
                        topUpBalance(bot, 200000.0);
                        System.out.println("🤖 Bot " + bot.getEmail() + " automatically topped up money.");
                    } else {
                        // 100% chance to start renting scooter for easy observation
                        if (random.nextInt(100) < 100) {
                            startRandomRental(bot);
                        }
                    }
                } else {
                    // Scenario: Currently renting
                    Rental rentalToFinish = activeRentals.get(0);
                    // Only end when scooter reaches destination OR has issue/maintenance
                    if (scooterSimulationService.hasArrived(rentalToFinish.getScooter().getId()) ||
                        !"IN_USE".equals(rentalToFinish.getScooter().getStatus())) {
                        finishRentalAndLeaveFeedback(rentalToFinish);
                    }
                }
            } catch (Exception e) {
                System.err.println("🤖 Error simulating Bot " + bot.getEmail() + ": " + e.getMessage());
            } finally {
                clearAuthentication();
            }
        }
    }

    private void topUpBalance(User bot, double amount) {
        bot.addBalance(amount);
        userRepository.save(bot);

        Transaction tx = new Transaction();
        tx.setUser(bot);
        tx.setAmount(amount);
        tx.setType("TOPUP");
        tx.setStatus("COMPLETED");
        tx.setDescription("System automatically topped up money for BOT");
        transactionRepository.save(tx);
    }

    private void startRandomRental(User bot) {
        // Find random AVAILABLE scooter
        List<Scooter> availableScooters = scooterRepository.findByStatus("AVAILABLE");
        if (availableScooters.isEmpty()) return;

        Scooter scooter = availableScooters.get(random.nextInt(availableScooters.size()));

        if (scooter.getCurrentLat() == null || scooter.getCurrentLng() == null) return;

        try {
            // Random destination within +- 0.01 degrees (about 1km)
            double endLat = scooter.getCurrentLat() + (random.nextDouble() - 0.5) * 0.02;
            double endLng = scooter.getCurrentLng() + (random.nextDouble() - 0.5) * 0.02;
            
            RoutingResponseDTO route = routingService.findShortestPath(scooter.getCurrentLat(), scooter.getCurrentLng(), endLat, endLng);
            scooterSimulationService.assignRoute(scooter.getId(), route.getPoints());

            RentalRequestDTO requestDTO = new RentalRequestDTO();
            requestDTO.setScooterId(scooter.getId());
            rentalService.startRental(requestDTO);
            
            System.out.println("🤖 Bot " + bot.getEmail() + " started renting scooter " + scooter.getName() + " and following route " + route.getDistance() + "m");
            messagingTemplate.convertAndSend("/topic/alerts", "🤖 Bot " + bot.getEmail() + " just started route " + Math.round(route.getDistance()) + "m using scooter " + scooter.getName() + "!");
        } catch (Exception e) {
            System.err.println("🤖 Error creating route for Bot: " + e.getMessage());
        }
    }

    private void finishRentalAndLeaveFeedback(Rental rental) {
        // End ride
        rentalService.endRental(rental.getId());
        
        // Leave random 4-5 stars feedback
        FeedbackRequestDTO feedbackDTO = new FeedbackRequestDTO();
        feedbackDTO.setRentalId(rental.getId());
        feedbackDTO.setRating(random.nextInt(2) + 4); // 4 or 5
        feedbackDTO.setComment(FEEDBACK_COMMENTS.get(random.nextInt(FEEDBACK_COMMENTS.size())));
        
        feedbackService.submitFeedback(feedbackDTO);
        
        System.out.println("🤖 Bot " + rental.getUser().getEmail() + " returned scooter " + rental.getScooter().getName() + " and rated " + feedbackDTO.getRating() + " stars.");
        messagingTemplate.convertAndSend("/topic/alerts", "🤖 Bot " + rental.getUser().getEmail() + " just returned scooter and rated the system!");
    }

    private void mockAuthentication(User user) {
        List<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + user.getRole()));
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                user.getEmail(), null, authorities);
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    private void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }
}
