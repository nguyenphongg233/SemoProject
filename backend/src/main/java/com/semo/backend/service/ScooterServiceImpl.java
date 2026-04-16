package com.semo.backend.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.semo.backend.dto.ScooterRequestDTO;
import com.semo.backend.dto.ScooterResponseDTO;
import com.semo.backend.entity.Scooter;
import com.semo.backend.repository.ScooterRepository;

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

    @Override
    public List<ScooterResponseDTO> getScootersByStatus(String status) {
        List<Scooter> scooters = scooterRepository.findByStatus(status);
        List<ScooterResponseDTO> responseDTOs = new ArrayList<>();

        for (Scooter scooter : scooters) {
            ScooterResponseDTO dto = new ScooterResponseDTO();
            dto.setId(scooter.getId().longValue());
            dto.setName(scooter.getCodeName());
            dto.setBatteryLevel(scooter.getBatteryLevel().intValue());
            dto.setStatus(scooter.getStatus());
            responseDTOs.add(dto);
        }

        return responseDTOs;
    }

    @Override
    public ScooterResponseDTO getScooterById(Integer id) {
        Scooter scooter = scooterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe với ID: " + id));

        ScooterResponseDTO responseDTO = new ScooterResponseDTO();
        responseDTO.setId(scooter.getId().longValue());
        responseDTO.setName(scooter.getCodeName());
        responseDTO.setBatteryLevel(scooter.getBatteryLevel().intValue());
        responseDTO.setStatus(scooter.getStatus());

        return responseDTO;
    }

    @Override
    public ScooterResponseDTO updateScooter(Integer id, ScooterRequestDTO requestDTO) {
        Scooter scooter = scooterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe với ID: " + id));

        scooter.setCodeName(requestDTO.getName());
        scooter.setBatteryLevel(requestDTO.getBatteryLevel().intValue());
        scooter.setStatus(requestDTO.getStatus());

        Scooter updatedScooter = scooterRepository.save(scooter);

        ScooterResponseDTO responseDTO = new ScooterResponseDTO();
        responseDTO.setId(updatedScooter.getId().longValue());
        responseDTO.setName(updatedScooter.getCodeName());
        responseDTO.setBatteryLevel(updatedScooter.getBatteryLevel().intValue());
        responseDTO.setStatus(updatedScooter.getStatus());

        return responseDTO;
    }
}