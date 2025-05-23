package com.ssafy.peachptich.repository;

import com.ssafy.peachptich.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String userEmail);

    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findByEmail(String email);
    Optional<User> findByUserId(Long userId);
    @Query("SELECT u.email FROM User u WHERE u.userId = :userId")
    String findEmailById(Long userId);
}