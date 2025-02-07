package com.ssafy.peachptich.repository;

import com.ssafy.peachptich.dto.response.HintResponse;
import com.ssafy.peachptich.entity.Hint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HintRepository extends JpaRepository<Hint, Long> {
    @Query("SELECT new com.ssafy.peachptich.dto.response.HintResponseDto(h.hint) FROM Hint h WHERE h.keyword.keywordId = :keywordId")
    List<HintResponse> findByKeywordId(@Param("keywordId") Long keywordId);
}
