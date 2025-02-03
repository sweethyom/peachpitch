package com.ssafy.peachptich.repository;

import com.ssafy.peachptich.dto.response.RankResponseDto;
import com.ssafy.peachptich.entity.UserKeyword;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserKeywordRepository extends CrudRepository<UserKeyword, Long> {

    // 선택된 횟수(count) 증가
    @Modifying
    @Query("UPDATE UserKeyword uk SET uk.count = uk.count+1 WHERE uk.user.userId  = :userId AND uk.keyword.keywordId = :keywordId")
    int incrementCount (@Param("userId") Long userId, @Param("keywordId") Long keywordId);

    // user가 고른 keyword 존재 여부
    boolean existsByUser_UserIdAndKeyword_KeywordId(Long userId, Long keywordId);

    // keyword 골라진 횟수 상위 3개
    @Query(value = "SELECT k.keyword, SUM(uk.count) FROM user_keyword uk JOIN keyword k ON uk.keyword_id = k.keyword_id GROUP BY uk.keyword_id ORDER BY SUM(uk.count) DESC LIMIT 3", nativeQuery = true)
    List<Object[]> findTop3KeywordsByCount();
}
