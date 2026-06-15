package com.semo.backend.seeder;

import java.util.Arrays;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.semo.backend.entity.Scooter;
import com.semo.backend.entity.User;
import com.semo.backend.entity.Rental;
import com.semo.backend.repository.ScooterRepository;
import com.semo.backend.repository.UserRepository;
import com.semo.backend.repository.RentalRepository;

import org.springframework.jdbc.core.JdbcTemplate;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final ScooterRepository scooterRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RentalRepository rentalRepository;
    private final JdbcTemplate jdbcTemplate;

    public DatabaseSeeder(ScooterRepository scooterRepository, UserRepository userRepository,
            PasswordEncoder passwordEncoder, RentalRepository rentalRepository, JdbcTemplate jdbcTemplate) {
        this.scooterRepository = scooterRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.rentalRepository = rentalRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        // Fix uninitialized versions for existing rows
        jdbcTemplate.execute("UPDATE rentals SET version = 0 WHERE version IS NULL");
        jdbcTemplate.execute("UPDATE users SET version = 0 WHERE version IS NULL");
        jdbcTemplate.execute("UPDATE scooters SET version = 0 WHERE version IS NULL");
        jdbcTemplate.execute("UPDATE transactions SET version = 0 WHERE version IS NULL");

        // Seed admin user
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

        // Seed customer user
        if (!userRepository.existsByEmail("customer@semo.com")) {
            User customer = new User(
                    "customer@semo.com",
                    passwordEncoder.encode("Customer@123"),
                    "Customer User",
                    "0987654321",
                    "CUSTOMER",
                    100000.0);
            userRepository.save(customer);
            System.out.println("✅ Customer account created successfully!");
            System.out.println("   Customer: customer@semo.com / Customer@123");
        }

        // Seed bot users
        for (int i = 1; i <= 3; i++) {
            String botEmail = "bot" + i + "@semo.com";
            if (!userRepository.existsByEmail(botEmail)) {
                User bot = new User(
                        botEmail,
                        passwordEncoder.encode("Bot@123"),
                        "[BOT] User " + i,
                        "090000000" + i,
                        "CUSTOMER",
                        200000.0);
                userRepository.save(bot);
                System.out.println("✅ Account created: " + botEmail + " successfully!");
            }
        }

        // Seed scooters
        if (scooterRepository.count() == 0) {
            Scooter s1 = createScooter("VinFast Feliz S", 100, "AVAILABLE", 21.00555, 105.84335);
            Scooter s2 = createScooter("Honda Vision 2023", 45, "IN_USE", 21.00498, 105.84292);
            Scooter s3 = createScooter("Yamaha Janus", 80, "AVAILABLE", 21.00621, 105.84567);
            Scooter s4 = createScooter("Piaggio Liberty", 20, "CHARGING", 21.00311, 105.84122);
            Scooter s5 = createScooter("Pega Aura", 60, "AVAILABLE", 21.00755, 105.84688);
            Scooter s6 = createScooter("Dat Bike Weaver", 95, "AVAILABLE", 21.00288, 105.84711);
            Scooter s7 = createScooter("Segway Ninebot S", 30, "IN_USE", 21.00396, 105.84308);
            Scooter s8 = createScooter("Super Soco CUx", 15, "MAINTENANCE", 21.00577, 105.84442);

            scooterRepository.saveAll(java.util.Objects.requireNonNull(Arrays.asList(s1, s2, s3, s4, s5, s6, s7, s8)));
            System.out.println("✅ Scooters sample data seeded successfully!");
        }

        // Tự động Migrate và Reset các Scooter bị lỗi trạng thái
        List<Scooter> allScootersForSync = scooterRepository.findAll();
        boolean needsSync = false;
        if (allScootersForSync != null && !allScootersForSync.isEmpty()) {
            for (Scooter s : allScootersForSync) {
                if ("ACTIVE".equals(s.getStatus())) {
                    s.setStatus("IN_USE");
                    needsSync = true;
                } else if ("MAINTENANCE".equals(s.getStatus())) {
                    s.setStatus("AVAILABLE");
                    needsSync = true;
                }
            }
            if (needsSync) {
                scooterRepository.saveAll(allScootersForSync);
                System.out.println("✅ Synchronized and reset scooters with stuck MAINTENANCE/ACTIVE status in Database!");
            }
        }

        // Migrate Rentals
        List<Rental> allRentals = rentalRepository.findAll();
        boolean rentalsUpdated = false;
        if (allRentals != null && !allRentals.isEmpty()) {
            for (Rental r : allRentals) {
                if ("ACTIVE".equals(r.getStatus())) {
                    r.setStatus("IN_USE");
                    rentalsUpdated = true;
                }
            }
            if (rentalsUpdated) {
                rentalRepository.saveAll(allRentals);
                System.out.println("✅ Synchronized ACTIVE rides to IN_USE in Database!");
            }
        }

        List<Scooter> scooters = scooterRepository.findAll();
        boolean updated = false;
        double[][] fallbackPositions = new double[][] {
                { 21.00555, 105.84335 },
                { 21.00498, 105.84292 },
                { 21.00521, 105.84411 },
                { 21.00618, 105.84378 },
                { 21.00441, 105.84366 },
                { 21.00592, 105.84248 },
                { 21.00396, 105.84308 },
                { 21.00577, 105.84442 },
        };

        for (int i = 0; i < scooters.size(); i++) {
            Scooter scooter = scooters.get(i);
            if (scooter.getCurrentLat() == null || scooter.getCurrentLng() == null) {
                double[] position = fallbackPositions[i % fallbackPositions.length];
                scooter.setCurrentLat(position[0]);
                scooter.setCurrentLng(position[1]);
                updated = true;
            }
        }

        if (updated) {
            scooterRepository.saveAll(java.util.Objects.requireNonNull(scooters));
            System.out.println("✅ Added coordinates for scooters without location.");
        }
    }

    private Scooter createScooter(String codeName, Integer batteryLevel, String status, Double lat, Double lng) {
        Scooter scooter = new Scooter(codeName, batteryLevel, status);
        scooter.setCurrentLat(lat);
        scooter.setCurrentLng(lng);
        return scooter;
    }
}