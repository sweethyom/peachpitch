package com.ssafy.peachptich.repository;

import com.ssafy.peachptich.entity.Hint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HintRepository extends JpaRepository<Hint, Long> {
}
