package com.semo.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.semo.backend.entity.MaintenanceLog;

public interface MaintenanceLogRepository extends JpaRepository<MaintenanceLog, Integer> {
    List<MaintenanceLog> findByScooterId(Integer scooterId);
    @Query("SELECT SUM(m.cost) FROM MaintenanceLog m")
    Double sumTotalMaintenanceCost();
    Optional<MaintenanceLog> findFirstByScooterIdOrderByCreatedAtDesc(Integer scooterId);
}
