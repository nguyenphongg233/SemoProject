package com.semo.backend.controller;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.lang.NonNull;
import org.springframework.web.multipart.MultipartFile;

import com.semo.backend.dto.UploadResponseDTO;
import com.semo.backend.service.FileService;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    private final FileService fileService;

    public UploadController(FileService fileService) {
        this.fileService = fileService;
    }

    /**
     * Upload avatar cho user (authenticated users)
     * POST /api/upload/avatar
     * 
     * @param file - File ảnh (multipart/form-data)
     * @return URL ảnh đã upload
     */
    @PostMapping("/avatar")
    public ResponseEntity<UploadResponseDTO> uploadAvatar(@RequestParam("file") MultipartFile file) {
        try {
            String fileUrl = fileService.uploadFile(file, "avatars");
            UploadResponseDTO response = new UploadResponseDTO(
                    fileUrl,
                    file.getOriginalFilename(),
                    file.getSize(),
                    file.getContentType());
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            // Validation errors (file type, size, etc.)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UploadResponseDTO("", "", 0, e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new UploadResponseDTO("", "", 0, "Lỗi upload file: " + e.getMessage()));
        }
    }

    /**
     * Upload hình ảnh cho scooter (Admin only)
     * POST /api/upload/scooter/{scooterId}
     * 
     * @param scooterId - ID của scooter
     * @param file      - File ảnh (multipart/form-data)
     * @return URL ảnh đã upload
     */
    @PostMapping("/scooter/{scooterId}")
    public ResponseEntity<UploadResponseDTO> uploadScooterImage(
            @PathVariable @NonNull Integer scooterId,
            @RequestParam("file") MultipartFile file) {
        try {
            String fileUrl = fileService.uploadFile(file, "scooters");
            UploadResponseDTO response = new UploadResponseDTO(
                    fileUrl,
                    file.getOriginalFilename(),
                    file.getSize(),
                    file.getContentType());
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            // Validation errors (file type, size, etc.)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UploadResponseDTO("", "", 0, e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new UploadResponseDTO("", "", 0, "Lỗi upload file: " + e.getMessage()));
        }
    }
}
