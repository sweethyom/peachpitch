package com.ssafy.peachptich.repository;

import com.ssafy.peachptich.entity.ChatHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface ChatHistoryRepository extends JpaRepository<ChatHistory, Long> {
    @Modifying
    @Transactional
    @Query("UPDATE ChatHistory c SET c.keyword1Id = :keywordId WHERE c.historyId = :historyId AND c.user1Id = :userId")
    int updateUser1Keyword(@Param("historyId") Long historyId, @Param("userId") Long userId, @Param("keywordId") Long keywordId);

    @Modifying
    @Transactional
    @Query("UPDATE ChatHistory c SET c.keyword2Id = :keywordId WHERE c.historyId = :historyId AND c.user2Id = :userId")
    int updateUser2Keyword(@Param("historyId") Long historyId, @Param("userId") Long userId, @Param("keywordId") Long keywordId);

    @Modifying
    @Transactional
    @Query("UPDATE ChatHistory c SET c.user1Feedback = :feedback WHERE c.historyId = :historyId AND c.user1Id = :userId")
    int updateUser1Feedback(@Param("historyId") Long historyId, @Param("userId") Long userId, @Param("feedback") String feedback);

    @Modifying
    @Transactional
    @Query("UPDATE ChatHistory c SET c.user2Feedback = :feedback WHERE c.historyId = :historyId AND c.user2Id = :userId")
    int updateUser2Feedback(@Param("historyId") Long historyId, @Param("userId") Long userId, @Param("feedback") String feedback);

    @Modifying
    @Transactional
    @Query("UPDATE ChatHistory c SET c.status = false WHERE c.historyId = :historyId")
    void updateStatusByHistoryId(@Param("historyId") Long historyId);
}

