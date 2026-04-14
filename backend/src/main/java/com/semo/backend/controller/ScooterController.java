package com.semo.backend.controller;

import com.semo.backend.entity.Scooter;
import com.semo.backend.repository.ScooterRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/scooters")
public class ScooterController {

    private final ScooterRepository scooterRepository;

    public ScooterController(ScooterRepository scooterRepository) {
        this.scooterRepository = scooterRepository;
    }

    @GetMapping
    public List<Scooter> getAllScooters() {
        return scooterRepository.findAll();
    }
}