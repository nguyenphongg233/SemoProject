package com.semo.backend.repository;

import com.semo.backend.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Integer> {
    List<Transaction> findByUserIdOrderByCreatedAtDesc(Integer userId);
    List<Transaction> findByOrderByCreatedAtDesc();
    void deleteByUserId(Integer userId);
}