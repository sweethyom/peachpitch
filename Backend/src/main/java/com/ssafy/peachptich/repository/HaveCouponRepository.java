package com.ssafy.peachptich.repository;

import com.ssafy.peachptich.entity.HaveCoupon;
import com.ssafy.peachptich.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HaveCouponRepository extends JpaRepository<HaveCoupon, Long> {
    public HaveCoupon findByUser(User user);
}
