package com.semo.backend.repository;

import java.util.List;

import com.semo.backend.entity.Scooter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ScooterRepository extends JpaRepository<Scooter, Integer> {
    List<Scooter> findByStatus(String status);
    List<Scooter> findByBatteryLevelLessThan(Double batteryLevel);
    long countByStatus(String status);
}