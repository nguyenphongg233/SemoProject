package com.semo.backend.seeder;

import java.util.Arrays;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.semo.backend.entity.Scooter;
import com.semo.backend.entity.User;
import com.semo.backend.repository.ScooterRepository;
import com.semo.backend.repository.UserRepository;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final ScooterRepository scooterRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(ScooterRepository scooterRepository, UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.scooterRepository = scooterRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
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
            System.out.println("✅ Đã tạo tài khoản Customer thành công!");
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
                System.out.println("✅ Đã tạo tài khoản " + botEmail + " thành công!");
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
            System.out.println("✅ Đã bơm dữ liệu mẫu cho bảng Scooters thành công!");
        }

        // Tự động Migrate các Scooter từ ACTIVE về lại IN_USE
        List<Scooter> legacyScooters = scooterRepository.findByStatus("ACTIVE");
        if (legacyScooters != null && !legacyScooters.isEmpty()) {
            for (Scooter s : legacyScooters) {
                s.setStatus("IN_USE");
            }
            scooterRepository.saveAll(legacyScooters);
            System.out.println("✅ Đã migrate " + legacyScooters.size() + " xe từ ACTIVE sang IN_USE trong Database!");
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
            System.out.println("✅ Đã bổ sung tọa độ cho các scooter chưa có vị trí.");
        }
    }

    private Scooter createScooter(String codeName, Integer batteryLevel, String status, Double lat, Double lng) {
        Scooter scooter = new Scooter(codeName, batteryLevel, status);
        scooter.setCurrentLat(lat);
        scooter.setCurrentLng(lng);
        return scooter;
    }
}