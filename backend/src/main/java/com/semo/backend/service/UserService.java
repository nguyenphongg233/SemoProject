package com.semo.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.semo.backend.dto.UserRequestDTO;
import com.semo.backend.dto.UserResponseDTO;
import com.semo.backend.entity.User;
import com.semo.backend.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Tạo user mới
     * 
     * @param requestDTO UserRequestDTO chứa thông tin user
     * @return UserResponseDTO
     */
    @Transactional
    public UserResponseDTO createUser(UserRequestDTO requestDTO) {
        // Kiểm tra email đã tồn tại chưa
        if (userRepository.existsByEmail(requestDTO.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng");
        }

        User user = new User(
                requestDTO.getEmail(),
                passwordEncoder.encode(requestDTO.getPassword()), // Hash password
                requestDTO.getFullName(),
                requestDTO.getPhoneNumber());

        User savedUser = userRepository.save(user);
        return mapToResponseDTO(savedUser);
    }

    /**
     * Lấy user theo ID
     * 
     * @param id User ID
     * @return UserResponseDTO
     */
    public UserResponseDTO getUserById(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User với ID: " + id));
        return mapToResponseDTO(user);
    }

    /**
     * Lấy user theo email
     * 
     * @param email User email
     * @return UserResponseDTO
     */
    public UserResponseDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User với email: " + email));
        return mapToResponseDTO(user);
    }

    /**
     * Lấy tất cả users
     * 
     * @return List UserResponseDTO
     */
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy tất cả users theo role
     * 
     * @param role User role (ADMIN, CUSTOMER, ...)
     * @return List UserResponseDTO
     */
    public List<UserResponseDTO> getUsersByRole(String role) {
        return userRepository.findByRole(role)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Update user
     * 
     * @param id         User ID
     * @param requestDTO UserRequestDTO chứa thông tin cần update
     * @return UserResponseDTO
     */
    @Transactional
    public UserResponseDTO updateUser(Integer id, UserRequestDTO requestDTO) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User với ID: " + id));

        // Nếu đổi email, kiểm tra email mới chưa được dùng
        if (!existingUser.getEmail().equals(requestDTO.getEmail()) &&
                userRepository.existsByEmail(requestDTO.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng");
        }

        if (requestDTO.getEmail() != null) {
            existingUser.setEmail(requestDTO.getEmail());
        }
        if (requestDTO.getFullName() != null) {
            existingUser.setFullName(requestDTO.getFullName());
        }
        if (requestDTO.getPhoneNumber() != null) {
            existingUser.setPhoneNumber(requestDTO.getPhoneNumber());
        }
        if (requestDTO.getPassword() != null && !requestDTO.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(requestDTO.getPassword())); // Hash new password
        }

        User updatedUser = userRepository.save(existingUser);
        return mapToResponseDTO(updatedUser);
    }

    /**
     * Xóa user
     * 
     * @param id User ID
     */
    @Transactional
    public void deleteUser(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User với ID: " + id));
        userRepository.delete(user);
    }

    /**
     * Kiểm tra xem email đã tồn tại hay chưa
     * 
     * @param email Email cần kiểm tra
     * @return true nếu email tồn tại, false nếu không
     */
    public boolean checkEmailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    /**
     * Admin reset password for a user. If newPassword is null or empty, generate a
     * temporary one.
     * Returns the plaintext new password (one-time) so admin can communicate it to
     * the user.
     */
    @Transactional
    public String adminResetPassword(Integer id, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User với ID: " + id));

        String rawPassword = newPassword;
        if (rawPassword == null || rawPassword.isEmpty()) {
            rawPassword = generateTemporaryPassword();
        }

        user.setPassword(passwordEncoder.encode(rawPassword));
        userRepository.save(user);
        return rawPassword;
    }

    /**
     * Change password for a user. Verifies current password before updating.
     */
    @Transactional
    public void changePassword(Integer id, String currentPassword, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User với ID: " + id));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Mật khẩu hiện tại không đúng.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private String generateTemporaryPassword() {
        // Simple temporary password generator: 12 chars alphanumeric with symbols
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 12; i++) {
            int idx = (int) (Math.random() * chars.length());
            sb.append(chars.charAt(idx));
        }
        return sb.toString();
    }

    /**
     * Lấy User entity (không phải DTO) theo email
     * Dùng cho internal processing (authentication, ...)
     * 
     * @param email User email
     * @return User entity
     */
    public User getUserEntityByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User với email: " + email));
    }

    /**
     * Lấy User entity (không phải DTO) theo ID
     * Dùng cho internal processing
     * 
     * @param id User ID
     * @return User entity
     */
    public User getUserEntityById(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User với ID: " + id));
    }

    /**
     * Map User entity sang UserResponseDTO
     * 
     * @param user User entity
     * @return UserResponseDTO
     */
    private UserResponseDTO mapToResponseDTO(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setRole(user.getRole());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }
}
