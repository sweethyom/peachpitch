package com.ssafy.peachptich.repository;

import com.ssafy.peachptich.entity.Item;
import com.ssafy.peachptich.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * 상품 정보를 조회
 *
 * @param name 조회할 상품이름
 * @param type 아이템의 타입
 *
 */
public interface ItemRepository extends JpaRepository<Item, Long> {
    Optional<Item> findByName(String name);
    // type으로 Item조회
    Optional<Item> findByType(Item.ItemType type);
    
    // 이름과 타입으로 아이템 조회
    Optional<Item> findByNameAndType(String name, Item.ItemType type);

    boolean existsByNameAndType(String name, Item.ItemType type);
}
