package com.semo.backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    // Allowed image extensions
    private static final Set<String> ALLOWED_EXTENSIONS = new HashSet<>(
            Arrays.asList("jpg", "jpeg", "png", "gif", "bmp", "webp"));

    // Allowed image content types
    private static final Set<String> ALLOWED_CONTENT_TYPES = new HashSet<>(
            Arrays.asList("image/jpeg", "image/png", "image/gif", "image/bmp", "image/webp",
                    "image/x-png", "image/x-windows-bmp"));

    /**
     * Upload file (ảnh đại diện, hình xe)
     * 
     * @param file      - File cần upload
     * @param subfolder - Thư mục con (avatars, scooters)
     * @return URL tương đối của file
     */
    public String uploadFile(MultipartFile file, String subfolder) throws IOException {
        // Validate file
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File không hợp lệ");
        }

        // Get file extension
        String originalFilename = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFilename);

        // Validate file type (chỉ cho phép ảnh) - kiểm tra cả extension lẫn
        // content-type
        String contentType = file.getContentType();
        boolean isValidContentType = contentType != null &&
                (contentType.startsWith("image/") || ALLOWED_CONTENT_TYPES.contains(contentType));
        boolean isValidExtension = ALLOWED_EXTENSIONS.contains(fileExtension);

        if (!isValidContentType && !isValidExtension) {
            throw new IllegalArgumentException(
                    "Chỉ cho phép upload file ảnh (extension: " + fileExtension + ", contentType: " + contentType
                            + ")");
        }

        // Validate file size (max 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException(
                    "Kích thước file không được vượt quá 5MB (file của bạn: " + (file.getSize() / 1024 / 1024) + "MB)");
        }

        // Tạo đường dẫn thư mục
        Path uploadPath = Paths.get(uploadDir, subfolder);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Tạo tên file mới (dùng UUID để tránh trùng lặp)
        String newFilename = UUID.randomUUID().toString() + "." + fileExtension;

        // Lưu file
        Path filePath = uploadPath.resolve(newFilename);
        Files.write(filePath, file.getBytes());

        // Trả về đường dẫn tương đối
        return "/" + uploadDir + "/" + subfolder + "/" + newFilename;
    }

    /**
     * Xóa file
     */
    public void deleteFile(String filePath) throws IOException {
        if (filePath == null || filePath.isEmpty()) {
            return;
        }

        // Remove leading "/" if exists
        String path = filePath.startsWith("/") ? filePath.substring(1) : filePath;
        Path file = Paths.get(path);

        if (Files.exists(file)) {
            Files.delete(file);
        }
    }

    /**
     * Lấy extension của file
     */
    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "jpg";
        }
        int lastDot = filename.lastIndexOf(".");
        return lastDot > 0 ? filename.substring(lastDot + 1).toLowerCase() : "jpg";
    }
}
