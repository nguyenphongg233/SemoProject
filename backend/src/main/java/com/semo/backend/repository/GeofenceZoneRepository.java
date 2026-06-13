package com.semo.backend.repository;

import com.semo.backend.entity.GeofenceZone;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GeofenceZoneRepository extends JpaRepository<GeofenceZone, Integer> {
    boolean existsByName(String name);
}