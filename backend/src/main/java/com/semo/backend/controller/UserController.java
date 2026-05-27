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

import com.semo.backend.dto.AdminResetPasswordRequestDTO;
import com.semo.backend.dto.PasswordChangeRequestDTO;
import com.semo.backend.dto.UserRequestDTO;
import com.semo.backend.dto.UserResponseDTO;
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
            @Valid @RequestBody UserRequestDTO requestDTO) {
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
     * Admin reset password for a user. Returns the new temporary password in
     * response.
     * POST /api/users/{id}/reset-password
     */
    @PostMapping("/{id}/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @PathVariable Integer id,
            @RequestBody AdminResetPasswordRequestDTO requestDTO) {
        // security: only admin should be allowed — SecurityConfig should enforce, but
        // double-check here
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN"));

        if (!isAdmin) {
            throw new RuntimeException("Access denied. Admin role required.");
        }

        String newPassword = userService.adminResetPassword(id, requestDTO.getNewPassword());
        return ResponseEntity.ok(Map.of("newPassword", newPassword));
    }

    /**
     * Change password for a user (self) or admin can change without current
     * password by using admin reset endpoint.
     * PUT /api/users/{id}/change-password
     */
    @PutMapping("/{id}/change-password")
    public ResponseEntity<Void> changePassword(
            @PathVariable Integer id,
            @RequestBody PasswordChangeRequestDTO requestDTO) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String principal = (String) auth.getPrincipal(); // principal is email as set by JwtAuthenticationFilter
        boolean isAdmin = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN"));

        // allow if admin or the authenticated user's email matches the target user's
        // email
        String targetEmail = userService.getUserEntityById(id).getEmail();
        if (!isAdmin && !principal.equals(targetEmail)) {
            throw new RuntimeException("Access denied.");
        }

        // For non-admin, require currentPassword; admin should use reset-password
        // endpoint instead
        if (!isAdmin && (requestDTO.getCurrentPassword() == null || requestDTO.getCurrentPassword().isEmpty())) {
            throw new RuntimeException("Mật khẩu hiện tại là bắt buộc.");
        }

        userService.changePassword(id, requestDTO.getCurrentPassword(), requestDTO.getNewPassword());
        return ResponseEntity.noContent().build();
    }
}
