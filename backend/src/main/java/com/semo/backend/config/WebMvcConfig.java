package com.semo.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import org.springframework.lang.NonNull;

/**
 * Cấu hình để serve static files (ảnh upload)
 * Cho phép truy cập ảnh qua HTTP từ thư mục uploads
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // Ánh xạ URL /uploads/** tới thư mục file:./uploads/
        registry
                .addResourceHandler("/uploads/**")
                .addResourceLocations("file:./uploads/");
    }
}
