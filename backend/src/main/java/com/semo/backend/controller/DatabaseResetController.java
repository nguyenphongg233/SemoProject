// only for reset do not implement in final version
// not used in project.

package com.semo.backend.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.semo.backend.entity.GeofenceZone;
import com.semo.backend.entity.Scooter;
import com.semo.backend.entity.User;
import com.semo.backend.repository.GeofenceZoneRepository;
import com.semo.backend.repository.ScooterRepository;
import com.semo.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/public/system")
public class DatabaseResetController {

    private final JdbcTemplate jdbcTemplate;
    private final ScooterRepository scooterRepository;
    private final GeofenceZoneRepository geofenceZoneRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    public DatabaseResetController(JdbcTemplate jdbcTemplate,
            ScooterRepository scooterRepository,
            GeofenceZoneRepository geofenceZoneRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.jdbcTemplate = jdbcTemplate;
        this.scooterRepository = scooterRepository;
        this.geofenceZoneRepository = geofenceZoneRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/hard-reset")
    @Transactional
    public ResponseEntity<String> hardResetDatabase() {
        // 1. Wipe out data in correct order to avoid foreign key violations
        jdbcTemplate.execute("DELETE FROM transactions");
        jdbcTemplate.execute("DELETE FROM maintenance_logs");
        jdbcTemplate.execute("DELETE FROM feedbacks");
        jdbcTemplate.execute("DELETE FROM rentals");
        jdbcTemplate.execute("DELETE FROM scooters");
        jdbcTemplate.execute("DELETE FROM geofence_zones");

        // Delete all users except admin
        jdbcTemplate.execute("DELETE FROM users WHERE email != 'admin@semo.com'");

        // Make sure admin exists just in case
        if (!userRepository.existsByEmail("admin@semo.com")) {
            User admin = new User(
                    "admin@semo.com",
                    passwordEncoder.encode("Admin@123"),
                    "Admin User",
                    "0123456789",
                    "ADMIN",
                    0.0);
            userRepository.save(admin);
        }

        // 2. Generate 8 Geofence Zones for Hanoi Districts
        List<GeofenceZone> zones = new ArrayList<>();
        zones.add(createZone("Quận Hoàn Kiếm", 21.0285, 105.8542, 2.0));
        zones.add(createZone("Quận Ba Đình", 21.0333, 105.8262, 2.5));
        zones.add(createZone("Quận Đống Đa", 21.0143, 105.8242, 2.5));
        zones.add(createZone("Quận Hai Bà Trưng", 21.0069, 105.8502, 2.5));
        zones.add(createZone("Quận Cầu Giấy", 21.0315, 105.7946, 3.5));
        zones.add(createZone("Quận Thanh Xuân", 20.9934, 105.8079, 3.0));
        zones.add(createZone("Quận Tây Hồ", 21.0664, 105.8197, 4.0));
        zones.add(createZone("Quận Hoàng Mai", 20.9691, 105.8450, 3.5));
        geofenceZoneRepository.saveAll(zones);

        // 3. Generate 100 Scooters
        String[] scooterModels = {
                "VinFast Feliz S", "Dat Bike Weaver", "Honda Vision", "Yamaha Janus",
                "Piaggio Liberty", "Pega Aura", "Super Soco CUx", "Yadea G5"
        };

        String[] statuses = { "AVAILABLE", "CHARGING", "MAINTENANCE" };
        Random random = new Random();
        List<Scooter> scooters = new ArrayList<>();

        for (int i = 0; i < 100; i++) {
            // Pick a random zone
            GeofenceZone zone = zones.get(random.nextInt(zones.size()));

            // Add a random offset to latitude and longitude (roughly within the zone
            // radius)
            // 0.01 degree is approx 1.1km.
            // If radius is 3.0km, offset can be up to 0.025 degrees
            double maxOffset = (zone.getRadiusKm() / 111.0) * 0.8; // keeping it slightly inside the circle
            double latOffset = (random.nextDouble() * 2 - 1) * maxOffset;
            double lngOffset = (random.nextDouble() * 2 - 1) * maxOffset;

            double lat = zone.getCenterLat() + latOffset;
            double lng = zone.getCenterLng() + lngOffset;

            String model = scooterModels[random.nextInt(scooterModels.length)] + " #" + (i + 1);

            // Status distribution: mostly AVAILABLE (70%), CHARGING (20%), MAINTENANCE
            // (10%)
            int randStatus = random.nextInt(100);
            String status;
            if (randStatus < 70)
                status = "AVAILABLE";
            else if (randStatus < 90)
                status = "CHARGING";
            else
                status = "MAINTENANCE";

            int battery = status.equals("CHARGING") ? random.nextInt(40) + 1 : random.nextInt(60) + 40; // 40-100%

            Scooter s = new Scooter(model, battery, status);
            s.setCurrentLat(lat);
            s.setCurrentLng(lng);

            scooters.add(s);
        }

        scooterRepository.saveAll(scooters);

        return ResponseEntity.ok("Database reset and seeded with 100 scooters in Hanoi successfully!");
    }

    private GeofenceZone createZone(String name, double lat, double lng, double radius) {
        GeofenceZone z = new GeofenceZone();
        z.setName(name);
        z.setCenterLat(lat);
        z.setCenterLng(lng);
        z.setRadiusKm(radius);
        return z;
    }
}
