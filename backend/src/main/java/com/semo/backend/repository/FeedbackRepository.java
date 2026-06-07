package com.semo.backend.repository;

import com.semo.backend.entity.Feedback;
import com.semo.backend.entity.Rental;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {
    boolean existsByRental(Rental rental);
    Optional<Feedback> findByRentalId(Integer rentalId);
    void deleteByUserId(Integer userId);
}