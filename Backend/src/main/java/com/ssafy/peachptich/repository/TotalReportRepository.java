package com.ssafy.peachptich.repository;

import com.ssafy.peachptich.entity.TotalReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TotalReportRepository extends JpaRepository<TotalReport, Long> {
    @Query(value = "SELECT * FROM total_report ORDER BY RAND() LIMIT 1", nativeQuery = true)
    TotalReport findTotalReport();
}
