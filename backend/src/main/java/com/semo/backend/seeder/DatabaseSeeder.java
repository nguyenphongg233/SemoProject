package com.semo.backend.seeder;

import java.util.Arrays;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.semo.backend.entity.Scooter;
import com.semo.backend.repository.ScooterRepository;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final ScooterRepository scooterRepository;

    public DatabaseSeeder(ScooterRepository scooterRepository) {
        this.scooterRepository = scooterRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (scooterRepository.count() == 0) {
            Scooter s1 = new Scooter("VinFast Feliz S", 100, "AVAILABLE");
            Scooter s2 = new Scooter("Honda Vision 2023", 45, "IN_USE");
            Scooter s3 = new Scooter("Yamaha Grande", 12, "MAINTENANCE");
            Scooter s4 = new Scooter("DatBike Weaver++", 88, "AVAILABLE");
            Scooter s5 = new Scooter("Yadea Xmen Neo", 5, "MAINTENANCE");
            Scooter s6 = new Scooter("Gogoro 2 Series", 60, "AVAILABLE");
            Scooter s7 = new Scooter("Segway Ninebot S", 30, "IN_USE");
            Scooter s8 = new Scooter("Super Soco CUx", 15, "MAINTENANCE");

            scooterRepository.saveAll(Arrays.asList(s1, s2, s3, s4, s5, s6, s7, s8));
            System.out.println("✅ Đã bơm dữ liệu mẫu cho bảng Scooters thành công!");
        }
    }
}