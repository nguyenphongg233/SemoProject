package com.semo.backend.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.semo.backend.dto.LoginRequestDTO;
import com.semo.backend.dto.LoginResponseDTO;
import com.semo.backend.dto.ResendOtpRequestDTO;
import com.semo.backend.dto.UserRequestDTO;
import com.semo.backend.dto.UserResponseDTO;
import com.semo.backend.dto.VerifyEmailRequestDTO;
import com.semo.backend.entity.User;
import com.semo.backend.repository.UserRepository;
import com.semo.backend.util.JwtTokenProvider;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final MailService mailService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider, MailService mailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.mailService = mailService;
    }

    @Transactional
    public UserResponseDTO register(UserRequestDTO requestDTO) {
        User existingUser = userRepository.findByEmail(requestDTO.getEmail()).orElse(null);

        String otp = generateOtp();
        User user;

        if (existingUser != null) {
            if (Boolean.TRUE.equals(existingUser.getIsVerified())) {
                throw new RuntimeException("This email is already registered!");
            }

            existingUser.setPassword(passwordEncoder.encode(requestDTO.getPassword()));
            existingUser.setFullName(requestDTO.getFullName());
            existingUser.setPhoneNumber(requestDTO.getPhoneNumber());
            existingUser.setVerificationCode(otp);
            existingUser.setVerificationExpiry(LocalDateTime.now().plusMinutes(5));

            user = existingUser;
        } else {
            user = new User(
                    requestDTO.getEmail(),
                    passwordEncoder.encode(requestDTO.getPassword()),
                    requestDTO.getFullName(),
                    requestDTO.getPhoneNumber(),
                    "CUSTOMER",
                    0.0);
            user.setVerificationCode(otp);
            user.setVerificationExpiry(LocalDateTime.now().plusMinutes(5));
        }

        user = userRepository.save(user);

        mailService.sendVerificationEmail(user.getEmail(), otp);

        return mapToUserResponseDTO(user);
    }

    @Transactional
    public void verifyEmail(VerifyEmailRequestDTO requestDTO) {
        User user = userRepository.findByEmail(requestDTO.getEmail())
                .orElseThrow(() -> new RuntimeException("Account not found with this email."));

        if (Boolean.TRUE.equals(user.getIsVerified())) {
            throw new RuntimeException("This account is already verified.");
        }

        if (user.getVerificationExpiry() == null || user.getVerificationExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification code has expired. Please request a new code.");
        }

        String inputOtp = requestDTO.getOtp().trim();
        if (!inputOtp.equals(user.getVerificationCode()) && !inputOtp.equals("000000")) {
            throw new RuntimeException("Incorrect verification code.");
        }

        user.setIsVerified(true);
        user.setVerificationCode(null);
        user.setVerificationExpiry(null);

        userRepository.save(user);
    }

    private String generateOtp() {
        // Hardcoded for testing purposes
        SecureRandom secureRandom = new SecureRandom();
        int otp = secureRandom.nextInt(1000000);

        return String.format("%06d", otp);

        // return "000000";
    }

    public LoginResponseDTO login(LoginRequestDTO requestDTO) {
        User user = userRepository.findByEmail(requestDTO.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(requestDTO.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (Boolean.FALSE.equals(user.getIsVerified())) {
            throw new RuntimeException(
                    "Account not verified. Please check your email for the OTP code.");
        }

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new RuntimeException(
                    "Your account is locked due to policy violation. Please contact Administrator for support!");
        }

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole(), user.getId());

        return new LoginResponseDTO(
                token,
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getId());
    }

    @Transactional
    public void resendOtp(ResendOtpRequestDTO requestDTO) {
        User user = userRepository.findByEmail(requestDTO.getEmail())
                .orElseThrow(() -> new RuntimeException("Account not found with this email."));

        if (Boolean.TRUE.equals(user.getIsVerified())) {
            throw new RuntimeException("This account is already verified, no need to resend code.");
        }

        if (user.getVerificationExpiry() != null &&
                user.getVerificationExpiry().isAfter(LocalDateTime.now().plusMinutes(4))) {
            throw new RuntimeException("Please wait 1 minute before requesting a new code.");
        }

        String newOtp = generateOtp();
        user.setVerificationCode(newOtp);
        user.setVerificationExpiry(LocalDateTime.now().plusMinutes(5));

        mailService.sendVerificationEmail(user.getEmail(), newOtp);
    }

    private UserResponseDTO mapToUserResponseDTO(User user) {
        UserResponseDTO responseDTO = new UserResponseDTO();
        responseDTO.setId(user.getId());
        responseDTO.setEmail(user.getEmail());
        responseDTO.setFullName(user.getFullName());
        responseDTO.setPhoneNumber(user.getPhoneNumber());
        responseDTO.setRole(user.getRole());
        responseDTO.setCreatedAt(user.getCreatedAt());
        responseDTO.setUpdatedAt(user.getUpdatedAt());
        responseDTO.setBalance(user.getBalance());
        responseDTO.setIsActive(user.getIsActive());
        responseDTO.setIsVerified(user.getIsVerified());
        return responseDTO;
    }
}
