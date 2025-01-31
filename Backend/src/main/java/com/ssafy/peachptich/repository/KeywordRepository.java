package com.ssafy.peachptich.repository;

import com.ssafy.peachptich.entity.Keyword;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KeywordRepository extends JpaRepository<Keyword, Long> {
    Optional<Keyword> findByKeyword(String keyword);

    @Query(value = "SELECT * FROM (SELECT * FROM keyword ORDER BY RAND() LIMIT 15) as temp ORDER BY keyword_id", nativeQuery = true)
    List<Keyword> findRandomKeyword();
}
