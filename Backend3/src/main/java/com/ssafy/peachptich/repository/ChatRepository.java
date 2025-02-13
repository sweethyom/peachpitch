package com.ssafy.peachptich.repository;

import com.ssafy.peachptich.entity.Chat;
import com.ssafy.peachptich.entity.ChatHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ChatRepository extends JpaRepository<Chat, Long> {
    /**
     * 모든 채팅 내용을 시간순으로 조회
     */
    List<Chat> findAllByOrderByCreatedAtDesc();

    /**
     * 특정 유저의 채팅 내용 조회
     */
    List<Chat> findByUserId(Long userId);

    /**
     * 특정 채팅 히스토리에 속한 채팅 조회
     */
    List<Chat> findByChatHistory(ChatHistory chatHistory);

    /**
     * 랜덤 채팅 조회
     */
    @Query(value = "SELECT * FROM chat ORDER BY RAND() LIMIT 1", nativeQuery = true)
    Chat findRandomChat();

    /**
     * 특정 기간 내의 채팅 조회
     */
    List<Chat> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
