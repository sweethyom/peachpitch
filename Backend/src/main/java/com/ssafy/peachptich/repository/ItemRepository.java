package com.ssafy.peachptich.repository;

import com.ssafy.peachptich.entity.Item;
import com.ssafy.peachptich.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * 상품 정보를 조회
 *
 * @param name 조회할 상품이름
 *
 */
public interface ItemRepository extends JpaRepository<Item, Long> {
    Optional<Item> findByName(String name);
}
