package com.semo.backend.dto;

import java.time.LocalDateTime;

public class UploadResponseDTO {
    private String url;
    private String filename;
    private long size;
    private String contentType;
    private LocalDateTime uploadedAt;

    public UploadResponseDTO(String url, String filename, long size, String contentType) {
        this.url = url;
        this.filename = filename;
        this.size = size;
        this.contentType = contentType;
        this.uploadedAt = LocalDateTime.now();
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public long getSize() {
        return size;
    }

    public void setSize(long size) {
        this.size = size;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}
