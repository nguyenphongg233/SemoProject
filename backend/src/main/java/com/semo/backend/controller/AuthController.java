package com.semo.backend.controller;

import com.semo.backend.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.semo.backend.service.AuthService;

import jakarta.validation.Valid;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> register(@Valid @RequestBody UserRequestDTO requestDTO) {
        UserResponseDTO responseDTO = authService.register(requestDTO);
        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }

    /**
     * Verify email with OTP
     * POST /api/users/verify-email
     */
    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@Valid @RequestBody VerifyEmailRequestDTO requestDTO) {
        authService.verifyEmail(requestDTO);
        return ResponseEntity.ok(Map.of("message", "Email verified successfully! You can now login."));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO requestDTO) {
        LoginResponseDTO responseDTO = authService.login(requestDTO);
        return ResponseEntity.ok(responseDTO);
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<Map<String, String>> resendOtp(@Valid @RequestBody ResendOtpRequestDTO requestDTO) {
        authService.resendOtp(requestDTO);
        return ResponseEntity.ok(Map.of("message", "New verification code sent. Please check your email (including Spam folder)."));
    }
}
