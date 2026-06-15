package com.semo.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.semo.backend.entity.User;

public interface UserRepository extends JpaRepository<User, Integer> {

    /**
     * Tìm User theo email
     * 
     * @param email email của user
     * @return Optional chứa User nếu tìm thấy
     */
    Optional<User> findByEmail(String email);

    /**
     * Kiểm tra xem email đã tồn tại trong database hay chưa
     * 
     * @param email email cần kiểm tra
     * @return true nếu email tồn tại, false nếu không
     */
    boolean existsByEmail(String email);

    /**
     * Tìm tất cả User theo role
     * 
     * @param role role cần tìm (ADMIN, CUSTOMER, ...)
     * @return List các User có role tương ứng
     */
    List<User> findByRole(String role);

    /**
     * Tìm User theo email với custom query
     * 
     * @param email email cần tìm
     * @return Optional chứa User
     */
    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findUserByEmail(@Param("email") String email);
}