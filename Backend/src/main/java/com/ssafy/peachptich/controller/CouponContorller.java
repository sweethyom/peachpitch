package com.ssafy.peachptich.controller;

import com.ssafy.peachptich.dto.request.CouponRequest;
import com.ssafy.peachptich.dto.response.CouponResponse;
import com.ssafy.peachptich.dto.response.ResponseDto;
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
    @PostMapping("/login/free")
    public ResponseEntity<ResponseDto<Void>> handleLoginCoupon(@RequestBody CouponRequest request) {
        couponService.handleLoginCoupon(request.getUserId());
        return ResponseEntity.ok().body(
                ResponseDto.<Void>builder()
                        .message("Successfully received coupon")
                        .build()
        );
    }

    // 사용자의 보유 쿠폰 수 조회
    @PostMapping("/have")
    public ResponseEntity<ResponseDto<CouponResponse>> getAvailableCoupons(@RequestBody CouponRequest request) {
        int couponCount = couponService.getAvailableCoupons(request.getUserId());
        CouponResponse response = CouponResponse.builder()
                .ea(couponCount)
                .build();
        return ResponseEntity.ok().body(ResponseDto.<CouponResponse>builder().message("Successfully retrieved available coupons").data(response).build());
    }

    // 쿠폰 사용
    @PostMapping("/use")
    public ResponseEntity<ResponseDto<Void>> useCoupon(@RequestBody CouponRequest request) {
        couponService.useCoupon(request.getUserId());
        return ResponseEntity.ok().body(
                ResponseDto.<Void>builder()
                        .message("Successfully used coupon")
                        .build()
        );
    }
}

