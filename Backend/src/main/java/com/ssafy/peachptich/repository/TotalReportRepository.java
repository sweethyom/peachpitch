package com.ssafy.peachptich.repository;

import com.ssafy.peachptich.entity.TotalReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface TotalReportRepository extends JpaRepository<TotalReport, Long> {
    // userId -> 합치고 user
    @Query("SELECT t FROM TotalReport t WHERE t.user.userId = :userId")
    Optional<TotalReport> findByUserId(Long userId);
}
