package com.semo.backend.util;

import com.semo.backend.entity.User;
import com.semo.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class AuthUtil {

    private final UserRepository userRepository;

    public AuthUtil(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User requireAuthenticatedUser() {
        Authentication auth = getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new RuntimeException("Access denied: Please log in again!");
        }

        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("System user not found"));
    }

    public User requireActiveAuthenticatedUser() {
        User user = requireAuthenticatedUser();

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new RuntimeException("Your account is locked. Please contact administrator!");
        }

        return user;
    }

    public User requireAdminAccess(String forbiddenMessage) {
        User user = requireActiveAuthenticatedUser();

        if (!"ADMIN".equals(user.getRole())) {
            throw new RuntimeException(forbiddenMessage);
        }

        return user;
    }

    public void requireAdminOrSelfAccess(Integer targetUserId, String forbiddenMessage) {
        User currentUser = requireActiveAuthenticatedUser();

        if (!"ADMIN".equals(currentUser.getRole()) && !currentUser.getId().equals(targetUserId)) {
            throw new RuntimeException(forbiddenMessage);
        }
    }

    private Authentication getAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }
}

