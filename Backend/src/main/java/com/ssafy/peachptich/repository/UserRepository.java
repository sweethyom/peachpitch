package com.ssafy.peachptich.repository;

import com.ssafy.peachptich.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String userEmail);
    User findByEmail(String email);
}