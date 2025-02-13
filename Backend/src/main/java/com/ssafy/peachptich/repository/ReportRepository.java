package com.ssafy.peachptich.repository;

import com.ssafy.peachptich.entity.ChatReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ReportRepository extends JpaRepository<ChatReport, Long> {
    /**
     * 대화 상세 리포트 조회
     */
    @Query(value = "SELECT * FROM chat_report ORDER BY RAND() LIMIT 1", nativeQuery = true)
    ChatReport findReport();

    List<ChatReport> findAllByOrderByChatHistory_CreatedAtDesc();
}
