package com.semo.backend.controller;

import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.core.io.InputStreamResource;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.lang.NonNull;

import com.semo.backend.dto.*;
import com.semo.backend.entity.User;
import com.semo.backend.repository.UserRepository;
import com.semo.backend.service.UserService;
import com.semo.backend.service.ExportService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final ExportService exportService;

    public UserController(UserService userService, UserRepository userRepository, ExportService exportService) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.exportService = exportService;
    }

    /**
     * Create new user
     * POST /api/users
     */
    @PostMapping
    public ResponseEntity<UserResponseDTO> createUser(@Valid @RequestBody UserRequestDTO requestDTO) {
        UserResponseDTO responseDTO = userService.createUser(requestDTO);
        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }

    /**
     * Get user by ID
     * GET /api/users/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable @NonNull Integer id) {
        UserResponseDTO responseDTO = userService.getUserById(id);
        return ResponseEntity.ok(responseDTO);
    }

    /**
     * Get user by email
     * GET /api/users/by-email?email=user@example.com
     */
    @GetMapping("/by-email")
    public ResponseEntity<UserResponseDTO> getUserByEmail(@RequestParam String email) {
        UserResponseDTO responseDTO = userService.getUserByEmail(email);
        return ResponseEntity.ok(responseDTO);
    }

    /**
     * Get all users
     * GET /api/users
     */
    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Export all users to Excel (For Admin)
    @GetMapping("/export")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<InputStreamResource> exportUsersToExcel() {
        List<User> users = userRepository.findAll();
        ByteArrayInputStream in = exportService.exportUsersToExcel(users);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=users.xlsx");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }

    /**
     * Get users by role
     * GET /api/users/by-role?role=ADMIN
     */
    @GetMapping("/by-role")
    public ResponseEntity<List<UserResponseDTO>> getUsersByRole(@RequestParam String role) {
        List<UserResponseDTO> users = userService.getUsersByRole(role);
        return ResponseEntity.ok(users);
    }

    /**
     * Update user
     * PUT /api/users/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(
            @PathVariable @NonNull Integer id,
            @Valid @RequestBody UserUpdateRequestDTO requestDTO) {
        UserResponseDTO responseDTO = userService.updateUser(id, requestDTO);
        return ResponseEntity.ok(responseDTO);
    }

    /**
     * Update current user's profile
     * PUT /api/users/update-profile
     */
    @PutMapping("/update-profile")
    public ResponseEntity<UserResponseDTO> updateProfile(
            @Valid @RequestBody UserUpdateRequestDTO requestDTO) {
        UserResponseDTO responseDTO = userService.updateProfile(requestDTO);
        return ResponseEntity.ok(responseDTO);
    }

    /**
     * Delete user
     * DELETE /api/users/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable @NonNull Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Check if email already exists
     * GET /api/users/check-email?email=user@example.com
     */
    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmailExists(@RequestParam String email) {
        boolean exists = userService.checkEmailExists(email);
        return ResponseEntity.ok(exists);
    }

    /**
     * Admin reset password for a user.
     * POST /api/users/{id}/reset-password
     */
    @PostMapping("/{id}/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @PathVariable @NonNull Integer id,
            @Valid @RequestBody AdminResetPasswordRequestDTO requestDTO) {

        String newPassword = userService.adminResetPassword(id, requestDTO.getNewPassword());
        return ResponseEntity.ok(Map.of("newPassword", newPassword));
    }

    /**
     * Change password for a user (Self only).
     * PUT /api/users/change-password
     */
    @PutMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody PasswordChangeRequestDTO requestDTO) {

        userService.changePassword(requestDTO.getCurrentPassword(), requestDTO.getNewPassword());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/wallet/deposit")
    public ResponseEntity<DepositResponseDTO> depositWallet(@Valid @RequestBody DepositRequestDTO requestDTO) {
        DepositResponseDTO response = userService.deposit(requestDTO);
        return ResponseEntity.ok(response);
    }

    // Lock/Unlock account API (ADMIN only)
    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<UserResponseDTO> toggleUserStatus(@PathVariable @NonNull Integer id) {
        UserResponseDTO updatedUser = userService.toggleUserStatus(id);
        return ResponseEntity.ok(updatedUser);
    }
}
