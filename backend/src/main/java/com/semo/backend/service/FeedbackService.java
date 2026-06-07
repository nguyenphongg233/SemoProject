package com.semo.backend.service;

import com.semo.backend.dto.FeedbackRequestDTO;
import com.semo.backend.dto.FeedbackResponseDTO;
import com.semo.backend.entity.Rental;
import com.semo.backend.entity.User;
import com.semo.backend.entity.Feedback;
import com.semo.backend.repository.UserRepository;
import com.semo.backend.repository.RentalRepository;
import com.semo.backend.repository.FeedbackRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FeedbackService {
    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final RentalRepository rentalRepository;

    public FeedbackService(FeedbackRepository feedbackRepository, UserRepository userRepository, RentalRepository rentalRepository) {
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
        this.rentalRepository = rentalRepository;
    }

    @Transactional
    public FeedbackResponseDTO submitFeedback(FeedbackRequestDTO requestDTO) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new RuntimeException("Truy cập bị từ chối: Vui lòng đăng nhập lại!");
        }

        User loggedInUser = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hệ thống"));

        Rental rental = rentalRepository.findById(requestDTO.getRentalId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chuyến đi"));

        if (!rental.getUser().getId().equals(loggedInUser.getId())) {
            throw new RuntimeException("Lỗi bảo mật: Bạn không thể đánh giá chuyến đi của người khác!");
        }

        if (!"COMPLETED".equals(rental.getStatus())) {
            throw new RuntimeException("Chỉ có thể đánh giá những chuyến đi đã hoàn thành!");
        }

        if (feedbackRepository.existsByRental(rental)) {
            throw new RuntimeException("Chuyến đi này đã được đánh giá rồi!");
        }

        Feedback feedback = new Feedback();
        feedback.setRental(rental);
        feedback.setUser(loggedInUser);
        feedback.setRating(requestDTO.getRating());
        feedback.setComment(requestDTO.getComment());

        feedback = feedbackRepository.save(feedback);

        return mapToDTO(feedback);
    }

    public java.util.List<FeedbackResponseDTO> getAllFeedbacks() {
        return feedbackRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    private FeedbackResponseDTO mapToDTO(Feedback feedback) {
        FeedbackResponseDTO dto = new FeedbackResponseDTO();
        dto.setId(feedback.getId());
        dto.setRentalId(feedback.getRental().getId());
        dto.setUserId(feedback.getUser().getId());
        dto.setUserName(feedback.getUser().getFullName());
        dto.setRating(feedback.getRating());
        dto.setComment(feedback.getComment());
        dto.setCreatedAt(feedback.getCreatedAt());
        return dto;
    }
}
