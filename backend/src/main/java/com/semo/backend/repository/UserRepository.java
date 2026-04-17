package com.semo.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.semo.backend.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
}