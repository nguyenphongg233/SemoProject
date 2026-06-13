package com.semo.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import com.semo.backend.repository.FeedbackRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.semo.backend.dto.*;
import com.semo.backend.entity.User;
import com.semo.backend.entity.Transaction;
import com.semo.backend.repository.RentalRepository;
import com.semo.backend.repository.UserRepository;
import com.semo.backend.repository.TransactionRepository;
import com.semo.backend.util.AuthUtil;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RentalRepository rentalRepository;
    private final TransactionRepository transactionRepository;
    private final FeedbackRepository feedbackRepository;
    private final AuthUtil authUtil;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       RentalRepository rentalRepository, TransactionRepository transactionRepository,
                       FeedbackRepository feedbackRepository, AuthUtil authUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.rentalRepository = rentalRepository;
        this.transactionRepository = transactionRepository;
        this.feedbackRepository = feedbackRepository;
        this.authUtil = authUtil;
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
                requestDTO.getPhoneNumber(),
                "CUSTOMER",
                0.0);

        user.setIsVerified(true);

        user = userRepository.save(user);
        return mapToResponseDTO(user);
    }

    /**
     * Lấy user theo ID
     * 
     * @param id User ID
     * @return UserResponseDTO
     */
    public UserResponseDTO getUserById(@NonNull Integer id) {
        authUtil.requireAdminOrSelfAccess(id, "Lỗi phân quyền: Bạn không có quyền xem thông tin user này!");
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
        authUtil.requireAdminAccess("Lỗi phân quyền: Chỉ Quản trị viên mới được dùng tính năng này!");
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
        authUtil.requireAdminAccess("Lỗi phân quyền: Chỉ Quản trị viên mới được dùng tính năng này!");
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
        authUtil.requireAdminAccess("Lỗi phân quyền: Chỉ Quản trị viên mới được dùng tính năng này!");
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
    public UserResponseDTO updateUser(@NonNull Integer id, UserUpdateRequestDTO requestDTO) {
        authUtil.requireAdminOrSelfAccess(id, "Lỗi phân quyền: Bạn không có quyền xem thông tin user này!");
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User với ID: " + id));

        if (requestDTO.getEmail() != null && !requestDTO.getEmail().isBlank()) {
            if (!existingUser.getEmail().equals(requestDTO.getEmail()) &&
                    userRepository.existsByEmail(requestDTO.getEmail())) {
                throw new RuntimeException("Email đã được sử dụng");
            }
            existingUser.setEmail(requestDTO.getEmail());
        }

        if (requestDTO.getFullName() != null) {
            existingUser.setFullName(requestDTO.getFullName());
        }

        if (requestDTO.getPhoneNumber() != null) {
            existingUser.setPhoneNumber(requestDTO.getPhoneNumber());
        }

        User updatedUser = userRepository.save(java.util.Objects.requireNonNull(existingUser));
        return mapToResponseDTO(updatedUser);
    }

    /**
     * Xóa user
     * 
     * @param id User ID
     */
    @Transactional
    public void deleteUser(@NonNull Integer id) {
        authUtil.requireAdminAccess("Lỗi phân quyền: Chỉ Quản trị viên mới được dùng tính năng này!");
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User với ID: " + id));

        feedbackRepository.deleteByUserId(id);
        transactionRepository.deleteByUserId(id);
        rentalRepository.deleteByUserId(id);
        userRepository.delete(java.util.Objects.requireNonNull(user));
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
    public String adminResetPassword(@NonNull Integer id, String newPassword) {
        authUtil.requireAdminAccess("Lỗi phân quyền: Chỉ Quản trị viên mới được dùng tính năng này!");
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
    public void changePassword(String currentPassword, String newPassword) {
        User user = authUtil.requireActiveAuthenticatedUser();

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
    public User getUserEntityById(@NonNull Integer id) {
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
        dto.setBalance(user.getBalance());
        dto.setIsActive(user.getIsActive());
        dto.setIsVerified(user.getIsVerified());
        return dto;
    }

    @Transactional
    public DepositResponseDTO deposit(DepositRequestDTO requestDTO) {
        User user = authUtil.requireActiveAuthenticatedUser();

        // Không cộng tiền ngay, tạo giao dịch chờ duyệt
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setAmount(requestDTO.getAmount());
        transaction.setType("DEPOSIT");
        transaction.setDescription("Nạp tiền vào ví điện tử SEMO");
        transaction.setStatus("PENDING");

        transactionRepository.save(transaction);

        return new DepositResponseDTO("Yêu cầu nạp tiền đã được gửi. Đang chờ Admin xét duyệt!", user.getBalance());
    }

    @Transactional
    public UserResponseDTO toggleUserStatus(@NonNull Integer targetUserId) {
        User admin = authUtil.requireAdminAccess("Lỗi phân quyền: Chỉ Quản trị viên mới được dùng tính năng này!");


        if (admin.getId().equals(targetUserId)) {
            throw new RuntimeException("Thao tác không hợp lệ: Bạn không thể tự khóa chính mình!");
        }

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng cần thao tác"));

        targetUser.setIsActive(!targetUser.getIsActive());

        userRepository.save(targetUser);

        return mapToResponseDTO(targetUser);
    }
}
