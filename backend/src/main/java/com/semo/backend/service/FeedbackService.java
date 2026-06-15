package com.semo.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.semo.backend.dto.FeedbackRequestDTO;
import com.semo.backend.dto.FeedbackResponseDTO;
import com.semo.backend.entity.Feedback;
import com.semo.backend.entity.Rental;
import com.semo.backend.entity.User;
import com.semo.backend.repository.FeedbackRepository;
import com.semo.backend.repository.RentalRepository;
import com.semo.backend.util.AuthUtil;

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

        if (requestDTO.getRentalId() == null) {
            throw new IllegalArgumentException("Invalid ride ID.");
        }

        Rental rental = rentalRepository.findById(java.util.Objects.requireNonNull(requestDTO.getRentalId()))
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (!rental.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Security error: You cannot review someone else's ride!");
        }

        if (!"COMPLETED".equals(rental.getStatus())) {
            throw new RuntimeException("You can only review completed rides!");
        }

        if (feedbackRepository.existsByRental(rental)) {
            throw new RuntimeException("This ride has already been reviewed!");
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
        authUtil.requireAdminAccess("Permission denied: Only Administrators can use this feature!");

        return feedbackRepository.findAllWithDetails().stream()
                .map(this::mapToDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    public java.util.List<FeedbackResponseDTO> getMyFeedbacks() {
        User user = authUtil.requireActiveAuthenticatedUser();
        return feedbackRepository.findByUserWithDetails(user).stream()
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
