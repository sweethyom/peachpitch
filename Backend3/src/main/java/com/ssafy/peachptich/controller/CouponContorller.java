package com.ssafy.peachptich.controller;

import com.ssafy.peachptich.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users/coupon")
public class CouponContorller {

    private final CouponService couponService;

    // 로그인 시 무료 쿠폰 처리
    @PostMapping("/login/{userId}")
    public ResponseEntity<Void> handleLoginCoupon(@PathVariable Long userId) {
        System.out.println("Received userId: " + userId);  // 로그 추가
        couponService.handleLoginCoupon(userId);
        return ResponseEntity.ok().build();
    }

    // 사용자의 보유 쿠폰 수 조회
    @GetMapping("/{userId}")
    public ResponseEntity<Integer> getAvailableCoupons(@PathVariable Long userId) {
        int couponCount = couponService.getAvailableCoupons(userId);
        return ResponseEntity.ok(couponCount);
    }

    // 쿠폰 사용
    @PostMapping("/use/{userId}")
    public ResponseEntity<Void> useCoupon(@PathVariable Long userId) {
        couponService.useCoupon(userId);
        return ResponseEntity.ok().build();
    }
}
