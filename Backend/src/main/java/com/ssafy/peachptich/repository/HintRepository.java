package com.ssafy.peachptich.repository;

import com.ssafy.peachptich.entity.Hint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HintRepository extends JpaRepository<Hint, Long> {
    List<Hint> findByKeyword_KeywordId(Long keywordId);
}
