package com.semo.backend.repository;

import com.semo.backend.entity.Rental;
import com.semo.backend.entity.User;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

import org.springframework.data.jpa.repository.Modifying;

public interface RentalRepository extends JpaRepository<Rental, Integer> {
    @Modifying
    @Query("DELETE FROM Rental r WHERE r.user.id = :userId")
    void deleteByUserId(@Param("userId") Integer userId);
    
    @EntityGraph(attributePaths = {"user", "scooter"})
    List<Rental> findByUserAndStatusOrderByStartTimeDesc(User user, String status);
    List<Rental> findByUserOrderByStartTimeDesc(User user);
    List<Rental> findByStatusOrderByStartTimeDesc(String status);
    List<Rental> findAllByOrderByStartTimeDesc();long countByStatus(String status);
    @Query("SELECT COALESCE(SUM(r.totalPrice), 0) FROM Rental r WHERE r.status = :status")
    Double sumTotalPriceByStatus(@Param("status") String status);
}