package com.ssafy.peachptich.repository;

import com.ssafy.peachptich.entity.HaveCoupon;
import com.ssafy.peachptich.entity.Item;
import com.ssafy.peachptich.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface HaveCouponRepository extends JpaRepository<HaveCoupon, Long> {
    public HaveCoupon findByUser(User user);
    @Query("SELECT h FROM HaveCoupon h WHERE h.user.userId = :userId " +
            "AND h.item.type = :itemType " +
            "AND h.expirationDate > :dateTime")
    Optional<HaveCoupon> findByUserIdAndItemTypeAndExpirationDateAfter(
            @Param("userId") Long userId,
            @Param("itemType") Item.ItemType itemType,
            @Param("dateTime") LocalDateTime dateTime
    );
    @Query("SELECT h FROM HaveCoupon h WHERE h.user.userId = :userId AND h.item = :item")
    Optional<HaveCoupon> findByUser_IdAndItem(
            @Param("userId") Long userId,
            @Param("item") Item item
    );
}
