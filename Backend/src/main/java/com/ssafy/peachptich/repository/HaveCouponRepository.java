package com.ssafy.peachptich.repository;

import com.ssafy.peachptich.entity.HaveCoupon;
import com.ssafy.peachptich.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HaveCouponRepository extends JpaRepository<HaveCoupon, Long> {
    public List<HaveCoupon> findByUser(User user);
}
