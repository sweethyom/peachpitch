package com.ssafy.peachptich.repository;

import com.ssafy.peachptich.entity.Keyword;
import com.ssafy.peachptich.entity.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PurchaseRepository extends JpaRepository<Purchase, Long> {
    @Query("SELECT p FROM Purchase p WHERE p.user.userId = :userId")
    Optional<Purchase> findByUserId(@Param("userId") Long userId);
    Optional<Purchase> findByOrderId(String orderId);
}
