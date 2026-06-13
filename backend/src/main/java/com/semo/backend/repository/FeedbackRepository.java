package com.semo.backend.repository;

import com.semo.backend.entity.Feedback;
import com.semo.backend.entity.Rental;
import com.semo.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {
    boolean existsByRental(Rental rental);
    Optional<Feedback> findByRentalId(Integer rentalId);
    List<Feedback> findByUser(User user);
    void deleteByUserId(Integer userId);
}