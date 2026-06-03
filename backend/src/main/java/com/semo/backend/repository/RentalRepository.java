package com.semo.backend.repository;

import com.semo.backend.entity.Rental;
import com.semo.backend.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface RentalRepository extends JpaRepository<Rental, Integer> {
    void deleteByUserId(Integer userId);
    List<Rental> findByUserAndStatusOrderByStartTimeDesc(User user, String status);
    List<Rental> findByUserOrderByStartTimeDesc(User user);
    List<Rental> findByStatusOrderByStartTimeDesc(String status);
    List<Rental> findAllByOrderByStartTimeDesc();long countByStatus(String status);
    @Query("SELECT COALESCE(SUM(r.totalPrice), 0) FROM Rental r WHERE r.status = :status")
    Double sumTotalPriceByStatus(@Param("status") String status);
}