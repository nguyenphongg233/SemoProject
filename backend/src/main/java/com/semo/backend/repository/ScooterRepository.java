package com.semo.backend.repository;

import java.util.List;

import com.semo.backend.entity.Scooter;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ScooterRepository extends JpaRepository<Scooter, Integer> {
    List<Scooter> findByStatus(String status);
    List<Scooter> findByBatteryLevelLessThan(Double batteryLevel);
    long countByStatus(String status);
    @Query("SELECT s FROM Scooter s WHERE s.status = 'AVAILABLE' AND s.batteryLevel < :threshold ORDER BY s.batteryLevel ASC")
    List<Scooter> findScootersForCharging(@Param("threshold") Integer threshold, Pageable pageable);
}