package com.semo.backend.repository;

import com.semo.backend.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Integer> {
    List<Transaction> findByUserIdOrderByCreatedAtDesc(Integer userId);
    List<Transaction> findByOrderByCreatedAtDesc();
    @Modifying
    @Query("DELETE FROM Transaction t WHERE t.user.id = :userId")
    void deleteByUserId(@Param("userId") Integer userId);
}