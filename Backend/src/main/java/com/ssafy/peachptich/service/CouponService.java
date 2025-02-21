package com.ssafy.peachptich.service;

import org.springframework.transaction.annotation.Transactional;

// CouponService (쿠폰 관리 전용)
public interface CouponService {
    void handleLoginCoupon(Long userId);

    boolean hasReceivedFreeCouponToday(Long userId);

    void issueFreeCoupon(Long userId);

    int getAvailableCoupons(Long userId);

    void useCoupon(Long userId);

    void handlePaidCoupon(Long userId, Integer ea);

}