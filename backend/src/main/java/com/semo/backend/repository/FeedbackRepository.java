package com.semo.backend.repository;

import com.semo.backend.entity.Feedback;
import com.semo.backend.entity.Rental;
import com.semo.backend.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {
    boolean existsByRental(Rental rental);
    Optional<Feedback> findByRentalId(Integer rentalId);
    
    @EntityGraph(attributePaths = {"user", "rental", "rental.scooter", "rental.user"})
    @Query("SELECT f FROM Feedback f ORDER BY f.createdAt DESC")
    List<Feedback> findAllWithDetails();
    
    @EntityGraph(attributePaths = {"user", "rental", "rental.scooter", "rental.user"})
    @Query("SELECT f FROM Feedback f WHERE f.user = :user ORDER BY f.createdAt DESC")
    List<Feedback> findByUserWithDetails(User user);

    List<Feedback> findByUser(User user);
    void deleteByUserId(Integer userId);
}