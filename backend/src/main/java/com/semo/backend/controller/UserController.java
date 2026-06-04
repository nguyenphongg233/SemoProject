package com.semo.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.semo.backend.dto.*;
import com.semo.backend.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Tạo user mới
     * POST /api/users
     */
    @PostMapping
    public ResponseEntity<UserResponseDTO> createUser(@Valid @RequestBody UserRequestDTO requestDTO) {
        UserResponseDTO responseDTO = userService.createUser(requestDTO);
        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }

    /**
     * Lấy user theo ID
     * GET /api/users/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Integer id) {
        UserResponseDTO responseDTO = userService.getUserById(id);
        return ResponseEntity.ok(responseDTO);
    }

    /**
     * Lấy user theo email
     * GET /api/users/by-email?email=user@example.com
     */
    @GetMapping("/by-email")
    public ResponseEntity<UserResponseDTO> getUserByEmail(@RequestParam String email) {
        UserResponseDTO responseDTO = userService.getUserByEmail(email);
        return ResponseEntity.ok(responseDTO);
    }

    /**
     * Lấy tất cả users
     * GET /api/users
     */
    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        List<UserResponseDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Lấy users theo role
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
            @PathVariable Integer id,
            @Valid @RequestBody UserUpdateRequestDTO requestDTO) {
        UserResponseDTO responseDTO = userService.updateUser(id, requestDTO);
        return ResponseEntity.ok(responseDTO);
    }

    /**
     * Xóa user
     * DELETE /api/users/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Kiểm tra email đã tồn tại hay chưa
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
            @PathVariable Integer id,
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

    // API Khóa/Mở khóa tài khoản (Chỉ ADMIN)
    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<UserResponseDTO> toggleUserStatus(@PathVariable Integer id) {
        UserResponseDTO updatedUser = userService.toggleUserStatus(id);
        return ResponseEntity.ok(updatedUser);
    }
}
