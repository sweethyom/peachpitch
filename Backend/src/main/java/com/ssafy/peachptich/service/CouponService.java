package com.ssafy.peachptich.service;

// CouponService (쿠폰 관리 전용)
public interface CouponService {
    void handleLoginCoupon(Long userId);
    void issueFreeCoupon(Long userId);

    int getAvailableCoupons(Long userId);

    void useCoupon(Long userId);

    void handlePaidCoupon(Long userId, Integer ea);

}