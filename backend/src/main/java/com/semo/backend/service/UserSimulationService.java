package com.semo.backend.service;

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

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Random;

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

    private final List<String> FEEDBACK_COMMENTS = Arrays.asList(
        "Xe đi rất mượt, cảm ơn Semo!",
        "Chuyến đi tuyệt vời, xe còn mới.",
        "Dịch vụ tốt, giá cả phải chăng.",
        "Ứng dụng dễ dùng, sẽ tiếp tục ủng hộ.",
        "Xe ổn định nhưng pin tụt hơi nhanh."
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

    @Scheduled(fixedRate = 60000) // Chạy mỗi 1 phút
    public void simulateBotBehaviors() {
        // Lấy danh sách bots (được đánh dấu bởi email có chữ bot và role CUSTOMER)
        List<User> bots = userRepository.findAll().stream()
                .filter(u -> u.getEmail().startsWith("bot") && "CUSTOMER".equals(u.getRole()))
                .toList();

        if (bots.isEmpty()) return;

        for (User bot : bots) {
            // Kiểm tra xem bot có chuyến đi nào đang diễn ra không
            List<Rental> activeRentals = rentalRepository.findByUserAndStatusOrderByStartTimeDesc(bot, "IN_USE");

            try {
                mockAuthentication(bot);

                if (activeRentals.isEmpty()) {
                    // Kịch bản: Không có chuyến đi
                    // 1. Kiểm tra số dư, nếu nhỏ hơn 50.000 VNĐ -> nạp tiền tự động
                    if (bot.getBalance() < 50000.0) {
                        topUpBalance(bot, 200000.0);
                        System.out.println("🤖 Bot " + bot.getEmail() + " đã tự động nạp thêm tiền.");
                    } else {
                        // 2. Có 30% tỷ lệ bắt đầu thuê xe mới
                        if (random.nextInt(100) < 30) {
                            startRandomRental(bot);
                        }
                    }
                } else {
                    // Kịch bản: Đang thuê xe
                    Rental rentalToFinish = activeRentals.get(0);
                    // Chỉ kết thúc khi xe đã đến đích (hết lộ trình)
                    if (scooterSimulationService.hasArrived(rentalToFinish.getScooter().getId())) {
                        finishRentalAndLeaveFeedback(rentalToFinish);
                    }
                }
            } catch (Exception e) {
                System.err.println("🤖 Lỗi khi giả lập Bot " + bot.getEmail() + ": " + e.getMessage());
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
        tx.setDescription("Hệ thống tự động nạp tiền cho BOT");
        transactionRepository.save(tx);
    }

    private void startRandomRental(User bot) {
        // Tìm xe AVAILABLE ngẫu nhiên
        List<Scooter> availableScooters = scooterRepository.findByStatus("AVAILABLE");
        if (availableScooters.isEmpty()) return;

        Scooter scooter = availableScooters.get(random.nextInt(availableScooters.size()));

        if (scooter.getCurrentLat() == null || scooter.getCurrentLng() == null) return;

        try {
            // Random đích đến cách khoảng +- 0.01 độ (khoảng 1km)
            double endLat = scooter.getCurrentLat() + (random.nextDouble() - 0.5) * 0.02;
            double endLng = scooter.getCurrentLng() + (random.nextDouble() - 0.5) * 0.02;
            
            RoutingResponseDTO route = routingService.findShortestPath(scooter.getCurrentLat(), scooter.getCurrentLng(), endLat, endLng);
            scooterSimulationService.assignRoute(scooter.getId(), route.getPoints());

            RentalRequestDTO requestDTO = new RentalRequestDTO();
            requestDTO.setScooterId(scooter.getId());
            rentalService.startRental(requestDTO);
            
            System.out.println("🤖 Bot " + bot.getEmail() + " bắt đầu thuê xe " + scooter.getName() + " và đi theo lộ trình " + route.getDistance() + "m");
            messagingTemplate.convertAndSend("/topic/alerts", "🤖 Bot " + bot.getEmail() + " vừa bắt đầu lộ trình " + Math.round(route.getDistance()) + "m bằng xe " + scooter.getName() + "!");
        } catch (Exception e) {
            System.err.println("🤖 Lỗi khi tạo lộ trình cho Bot: " + e.getMessage());
        }
    }

    private void finishRentalAndLeaveFeedback(Rental rental) {
        // Kết thúc chuyến
        rentalService.endRental(rental.getId());
        
        // Để lại feedback ngẫu nhiên từ 4-5 sao
        FeedbackRequestDTO feedbackDTO = new FeedbackRequestDTO();
        feedbackDTO.setRentalId(rental.getId());
        feedbackDTO.setRating(random.nextInt(2) + 4); // 4 hoặc 5
        feedbackDTO.setComment(FEEDBACK_COMMENTS.get(random.nextInt(FEEDBACK_COMMENTS.size())));
        
        feedbackService.submitFeedback(feedbackDTO);
        
        System.out.println("🤖 Bot " + rental.getUser().getEmail() + " đã trả xe " + rental.getScooter().getName() + " và đánh giá " + feedbackDTO.getRating() + " sao.");
        messagingTemplate.convertAndSend("/topic/alerts", "🤖 Bot " + rental.getUser().getEmail() + " vừa trả xe và đánh giá hệ thống!");
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
