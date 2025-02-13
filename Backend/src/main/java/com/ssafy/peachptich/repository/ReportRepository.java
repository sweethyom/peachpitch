package com.ssafy.peachptich.repository;

import com.ssafy.peachptich.entity.ChatReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReportRepository extends JpaRepository<ChatReport, Long> {
    /**
     * 대화 상세 리포트 조회
     */

    // 특정 사용자의 대화 리포트들의 전체 목록 조회
    @Query("SELECT cr FROM ChatReport cr WHERE cr.user.userId = :userId ORDER BY cr.chatHistory.createdAt DESC")
    List<ChatReport> findAllByUserIdOrderByChatHistory_CreatedAtDesc(@Param("userId") Long userId);
    
    // 특정 사용자의 특정 대화에 대한 리포트 조회
    @Query("SELECT cr FROM ChatReport cr WHERE cr.user.userId = :userId AND cr.chatHistory.historyId = :chatHistoryId")
    Optional<ChatReport> findByUserIdAndChatHistoryId(@Param("userId") Long userId, @Param("chatHistoryId") Long chatHistoryId);
    // 랜덤 스크립트
    @Query(value = "SELECT * FROM chat_report ORDER BY RAND() LIMIT 1", nativeQuery = true)
    ChatReport findReport();



    List<ChatReport> findAllByOrderByChatHistory_CreatedAtDesc();


}
