package com.semo.backend.service;

import com.semo.backend.dto.ScooterRequestDTO;
import com.semo.backend.dto.ScooterResponseDTO;
import com.semo.backend.entity.Scooter;
import com.semo.backend.repository.ScooterRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ScooterServiceImpl implements ScooterService {

    private final ScooterRepository scooterRepository;

    public ScooterServiceImpl(ScooterRepository scooterRepository) {
        this.scooterRepository = scooterRepository;
    }

    @Override
    public ScooterResponseDTO createScooter(ScooterRequestDTO requestDTO) {
        Scooter scooter = new Scooter();
        scooter.setCodeName(requestDTO.getName());
        scooter.setBatteryLevel(requestDTO.getBatteryLevel().intValue());
        scooter.setStatus(requestDTO.getStatus());

        Scooter savedScooter = scooterRepository.save(scooter);

        ScooterResponseDTO responseDTO = new ScooterResponseDTO();
        responseDTO.setId(savedScooter.getId().longValue());
        responseDTO.setName(savedScooter.getCodeName());
        responseDTO.setBatteryLevel(savedScooter.getBatteryLevel().intValue());
        responseDTO.setStatus(savedScooter.getStatus());

        return responseDTO;
    }

    @Override
    public List<ScooterResponseDTO> getAllScooters() {
        List<Scooter> scooters = scooterRepository.findAll();
        List<ScooterResponseDTO> responseDTOs = new ArrayList<>();

        for (Scooter scooter : scooters) {
            ScooterResponseDTO dto = new ScooterResponseDTO();

            if (scooter.getId() != null)
                dto.setId(scooter.getId().longValue());
            dto.setName(scooter.getCodeName());
            if (scooter.getBatteryLevel() != null)
                dto.setBatteryLevel(scooter.getBatteryLevel().intValue());
            dto.setStatus(scooter.getStatus());

            responseDTOs.add(dto);
        }

        return responseDTOs;
    }

    @Override
    public Page<ScooterResponseDTO> getAllScootersPaged(int page, int size) {
        Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);

        Page<Scooter> scooterPage = scooterRepository.findAll(pageable);

        return scooterPage.map(scooter -> {
            ScooterResponseDTO dto = new ScooterResponseDTO();
            dto.setId(scooter.getId().longValue());
            dto.setName(scooter.getCodeName());
            dto.setBatteryLevel(scooter.getBatteryLevel().intValue());
            dto.setStatus(scooter.getStatus());
            return dto;
        });
    }
}