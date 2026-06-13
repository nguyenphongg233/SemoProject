package com.semo.backend.service;

import com.semo.backend.entity.SystemConfig;
import com.semo.backend.repository.SystemConfigRepository;
import com.semo.backend.dto.SystemConfigRequestDTO;
import com.semo.backend.dto.SystemConfigResponseDTO;
import com.semo.backend.dto.SystemConfigUpdateRequestDTO;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SystemConfigService {

    private final SystemConfigRepository configRepository;

    public SystemConfigService(SystemConfigRepository configRepository) {
        this.configRepository = configRepository;
    }

    @Cacheable(value = "system_configs", key = "#key")
    public String getConfigValue(@NonNull String key, String defaultValue) {
        return configRepository.findById(key)
                .map(SystemConfig::getConfigValue)
                .orElse(defaultValue);
    }

    @Cacheable(value = "system_configs", key = "'all_configs'")
    public List<SystemConfigResponseDTO> getAllConfigs() {
        return configRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    @Cacheable(value = "system_configs", key = "#key")
    public SystemConfigResponseDTO getConfigByKey(@NonNull String key) {
        SystemConfig config = configRepository.findById(key)
                .orElseThrow(() -> new RuntimeException("Khóa cấu hình '" + key + "' không tồn tại!"));
        return mapToResponseDTO(config);
    }

    @Transactional
    @CacheEvict(value = "system_configs", key = "'all_configs'")
    public SystemConfigResponseDTO createConfig(SystemConfigRequestDTO requestDTO) {
        String key = requestDTO.getKey();
        String value = requestDTO.getValue();
        String description = requestDTO.getDescription();

        if (key == null || key.isBlank()) {
            throw new IllegalArgumentException("Khóa cấu hình không được để trống!");
        }

        if (configRepository.existsById(key)) {
            throw new RuntimeException("Khóa cấu hình '" + key + "' đã tồn tại!");
        }

        SystemConfig newConfig = new SystemConfig(key, value, description);
        newConfig = configRepository.save(newConfig);

        return mapToResponseDTO(newConfig);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "system_configs", key = "#key"),
            @CacheEvict(value = "system_configs", key = "'all_configs'")
    })
    public SystemConfigResponseDTO updateConfig(@NonNull String key, SystemConfigUpdateRequestDTO requestDTO) {
        SystemConfig config = configRepository.findById(key)
                .orElseThrow(() -> new RuntimeException("Khóa cấu hình '" + key + "' không tồn tại!"));

        String value = requestDTO.getValue();
        String description = requestDTO.getDescription();

        config.setConfigValue(value);
        if (description != null) {
            config.setDescription(description);
        }

        config = configRepository.save(config);

        return mapToResponseDTO(config);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "system_configs", key = "#key"),
            @CacheEvict(value = "system_configs", key = "'all_configs'")
    })
    public void deleteConfig(@NonNull String key) {
        if (!configRepository.existsById(key)) {
            throw new RuntimeException("Khóa cấu hình '" + key + "' không tồn tại!");
        }
        configRepository.deleteById(key);
    }

    public double getConfigAsDouble(@NonNull String key, double defaultValue) {
        try {
            return Double.parseDouble(getConfigValue(key, String.valueOf(defaultValue)));
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    private SystemConfigResponseDTO mapToResponseDTO(SystemConfig config) {
        SystemConfigResponseDTO responseDTO = new SystemConfigResponseDTO();
        responseDTO.setKey(config.getConfigKey());
        responseDTO.setValue(config.getConfigValue());
        responseDTO.setDescription(config.getDescription());
        return responseDTO;
    }
}