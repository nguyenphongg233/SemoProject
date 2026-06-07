package com.semo.backend.service;

import com.semo.backend.dto.FeedbackRequestDTO;
import com.semo.backend.dto.FeedbackResponseDTO;
import com.semo.backend.entity.Rental;
import com.semo.backend.entity.User;
import com.semo.backend.entity.Feedback;
import com.semo.backend.repository.RentalRepository;
import com.semo.backend.repository.FeedbackRepository;
import com.semo.backend.util.AuthUtil;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FeedbackService {
    private final FeedbackRepository feedbackRepository;
    private final RentalRepository rentalRepository;
    private final AuthUtil authUtil;

    public FeedbackService(FeedbackRepository feedbackRepository, RentalRepository rentalRepository,
            AuthUtil authUtil) {
        this.feedbackRepository = feedbackRepository;
        this.rentalRepository = rentalRepository;
        this.authUtil = authUtil;
    }

    @Transactional
    public FeedbackResponseDTO submitFeedback(FeedbackRequestDTO requestDTO) {
        User user = authUtil.requireActiveAuthenticatedUser();

        Rental rental = rentalRepository.findById(requestDTO.getRentalId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chuyến đi"));

        if (!rental.getUser().getId().equals(user.getId())) {
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
        feedback.setUser(user);
        feedback.setRating(requestDTO.getRating());
        feedback.setComment(requestDTO.getComment());

        feedback = feedbackRepository.save(feedback);

        return mapToDTO(feedback);
    }

    public java.util.List<FeedbackResponseDTO> getAllFeedbacks() {
        authUtil.requireAdminAccess("Lỗi phân quyền: Chỉ Quản trị viên mới được dùng tính năng này!");

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
