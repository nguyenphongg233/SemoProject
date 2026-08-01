package com.semo.backend;

import com.semo.backend.repository.ScooterRepository;
import com.semo.backend.repository.StationRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.junit.jupiter.api.Test;
import com.semo.backend.entity.Station;

@SpringBootTest
public class DbDebugRunner {
    @Autowired
    private ScooterRepository scooterRepository;
    @Autowired
    private StationRepository stationRepository;

    @Test
    public void debugDb() {
        System.out.println("========== DEBUG DB ==========");
        System.out.println("Total Stations: " + stationRepository.count());
        System.out.println("Total Scooters: " + scooterRepository.count());
        System.out.println("Available Scooters: " + scooterRepository.countByStatus("AVAILABLE"));
        
        for (Station st : stationRepository.findAll()) {
            System.out.println("Station " + st.getId() + " - " + st.getName() + " - Total scooters: " + scooterRepository.findByStationId(st.getId()).size());
        }
        System.out.println("==============================");
    }
}
