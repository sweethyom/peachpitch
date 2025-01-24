package com.ssafy.peachptich.repository;

import com.ssafy.peachptich.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}