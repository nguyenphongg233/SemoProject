package com.semo.backend.dto;

import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotNull;

public class UploadRequestDTO {

    @NotNull(message = "File không được để trống")
    private MultipartFile file;

    public UploadRequestDTO() {
    }

    public UploadRequestDTO(MultipartFile file) {
        this.file = file;
    }

    public MultipartFile getFile() {
        return file;
    }

    public void setFile(MultipartFile file) {
        this.file = file;
    }
}
