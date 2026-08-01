package com.semo.backend.seeder;

import java.util.Arrays;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.semo.backend.entity.Scooter;
import com.semo.backend.entity.Station;
import com.semo.backend.entity.User;
import com.semo.backend.entity.Rental;
import com.semo.backend.repository.ScooterRepository;
import com.semo.backend.repository.UserRepository;
import com.semo.backend.repository.RentalRepository;
import com.semo.backend.repository.StationRepository;

import org.springframework.jdbc.core.JdbcTemplate;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final ScooterRepository scooterRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RentalRepository rentalRepository;
    private final StationRepository stationRepository;
    private final JdbcTemplate jdbcTemplate;

    public DatabaseSeeder(ScooterRepository scooterRepository, UserRepository userRepository,
            PasswordEncoder passwordEncoder, RentalRepository rentalRepository, StationRepository stationRepository, JdbcTemplate jdbcTemplate) {
        this.scooterRepository = scooterRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.rentalRepository = rentalRepository;
        this.stationRepository = stationRepository;
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
        boolean needsReset = true; // FORCE RESET

        if (needsReset) {
            System.out.println("⚠️ TRUNCATING RENTALS, TRANSACTIONS, SCOOTERS, STATIONS...");
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0;");
            jdbcTemplate.execute("TRUNCATE TABLE transactions;");
            jdbcTemplate.execute("TRUNCATE TABLE rentals;");
            jdbcTemplate.execute("TRUNCATE TABLE scooters;");
            jdbcTemplate.execute("TRUNCATE TABLE stations;");
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1;");
            System.out.println("✅ Truncate completed!");

            // Seed Stations
            List<Station> stationsToSave = Arrays.asList(
                new Station("Hồ Hoàn Kiếm (Phố đi bộ)", 21.028511, 105.852260, 30),
                new Station("Hồ Tây (Đường Thanh Niên)", 21.046030, 105.836968, 30),
                new Station("Vincom Center Bà Triệu", 21.010557, 105.849495, 25),
                new Station("Đại học Bách Khoa Hà Nội", 21.005550, 105.843350, 40),
                new Station("Đại học Quốc gia Hà Nội (Cầu Giấy)", 21.037803, 105.781358, 30),
                new Station("Lotte Center Hanoi (Liễu Giai)", 21.031853, 105.812398, 25),
                new Station("Sân vận động Mỹ Đình", 21.020583, 105.763071, 40),
                new Station("Aeon Mall Long Biên", 21.028475, 105.900407, 35),
                new Station("Royal City (Nguyễn Trãi)", 21.003310, 105.815993, 30),
                new Station("Công viên Thống Nhất", 21.016333, 105.845942, 25),
                new Station("Học viện Bưu chính Viễn thông", 20.980644, 105.787723, 30),
                new Station("Aeon Mall Hà Đông", 20.986641, 105.751682, 40),
                new Station("Melinh Plaza Hà Đông", 20.963495, 105.766133, 25),
                new Station("Bến xe Yên Nghĩa", 20.950792, 105.748378, 35),
                new Station("Học viện An ninh Nhân dân", 20.979313, 105.790906, 30),
                new Station("Ga Cát Linh", 21.028795, 105.823610, 35),
                new Station("Đại học Y Hà Nội", 21.002970, 105.830206, 30),
                new Station("Keangnam Landmark 72", 21.016912, 105.782161, 40),
                new Station("Bến xe Mỹ Đình", 21.028688, 105.778103, 40),
                new Station("Times City (Minh Khai)", 20.995963, 105.867451, 40)
            );
            stationRepository.saveAll(stationsToSave);
            System.out.println("✅ 20 Realistic Hanoi & Ha Dong Stations seeded successfully!");
        }

        // Seed scooters
        if (scooterRepository.count() == 0) {
            List<Station> stations = stationRepository.findAll();
            int scooterCounter = 1;
            String[] models = {"VinFast Feliz S", "Honda Vision 2023", "Yamaha Janus", "Piaggio Liberty", "Dat Bike Weaver"};
            String[] statuses = {"AVAILABLE", "AVAILABLE", "AVAILABLE", "AVAILABLE", "IN_USE", "CHARGING"};

            for (Station st : stations) {
                // Thêm 10 - 15 xe cho mỗi trạm
                int numScooters = (int) (Math.random() * 6) + 10; 
                for (int i = 0; i < numScooters; i++) {
                    String model = models[(int) (Math.random() * models.length)];
                    String status = statuses[(int) (Math.random() * statuses.length)];
                    int battery = (status.equals("CHARGING")) ? (int) (Math.random() * 40 + 10) : (int) (Math.random() * 60 + 40);
                    
                    // Slightly randomize location around the station
                    double latOffset = (Math.random() - 0.5) * 0.0005;
                    double lngOffset = (Math.random() - 0.5) * 0.0005;

                    Scooter s = createScooter(model + " #" + scooterCounter, battery, status, st.getLat() + latOffset, st.getLng() + lngOffset, st);
                    scooterRepository.save(s);
                    scooterCounter++;
                }
            }
            System.out.println("✅ Realistic Scooters seeded successfully across " + stations.size() + " stations!");
        }
    }

    private Scooter createScooter(String codeName, Integer batteryLevel, String status, Double lat, Double lng, Station station) {
        Scooter scooter = new Scooter(codeName, batteryLevel, status);
        scooter.setCurrentLat(lat);
        scooter.setCurrentLng(lng);
        scooter.setStation(station);
        return scooter;
    }
}