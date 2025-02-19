package com.ssafy.peachptich.controller;

import com.ssafy.peachptich.dto.request.CouponRequest;
import com.ssafy.peachptich.dto.response.CouponResponse;
import com.ssafy.peachptich.dto.response.ResponseDto;
import com.ssafy.peachptich.service.CouponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users/coupon")
@Tag(name = "CouponController", description = "쿠폰 기능 관련 컨트롤러")
public class CouponContorller {

    private final CouponService couponService;

    // 로그인 시 무료 쿠폰 처리
    @PostMapping("/login/free")
    @Operation(summary = "무료 쿠폰 처리", description = "무료 쿠폰을 추가합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "무료 쿠폰을 성공적으로 추가함")
    })
    public ResponseEntity<ResponseDto<Void>> handleLoginCoupon(@RequestBody CouponRequest request) {
        try {
            couponService.handleLoginCoupon(request.getUserId());
            return ResponseEntity.ok().body(
                    ResponseDto.<Void>builder()
                            .message("Successfully received coupon")
                            .build()
            );
            } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    ResponseDto.<Void>builder()
                            .message(e.getMessage())
                            .build()
            );
        }
    }


    // 무료 쿠폰 수령 여부 확인
    @GetMapping("/status")
    @Operation(summary = "무료 쿠폰 수령 여부 확인", description = "무료 쿠폰의 수령 여부를 확인합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "true:수령 확인 / false:수령하지 않음")
    })
    public ResponseEntity<ResponseDto<Boolean>> checkFreeCouponStatus(@RequestParam Long userId) {
        boolean hasReceived = couponService.hasReceivedFreeCouponToday(userId);
        return ResponseEntity.ok().body(
                ResponseDto.<Boolean>builder()
                        .message("Successfully checked coupon status")
                        .data(hasReceived)
                        .build()
        );
    }


    // 사용자의 보유 쿠폰 수 조회
    @PostMapping("/have")
    @Operation(summary = "보유 쿠폰 수 조회", description = "사용자의 보유 쿠폰 수를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "성공적으로 조회함")
    })
    public ResponseEntity<ResponseDto<CouponResponse>> getAvailableCoupons(@RequestBody CouponRequest request) {
        int couponCount = couponService.getAvailableCoupons(request.getUserId());
        CouponResponse response = CouponResponse.builder()
                .ea(couponCount)
                .build();
        return ResponseEntity.ok().body(ResponseDto.<CouponResponse>builder().message("Successfully retrieved available coupons").data(response).build());
    }

    // 쿠폰 사용
    @PostMapping("/use")
    @Operation(summary = "쿠폰 사용", description = "쿠폰 사용을 처리합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "성공적으로 처리됨")
    })
    public ResponseEntity<ResponseDto<Void>> useCoupon(@RequestBody CouponRequest request) {
        couponService.useCoupon(request.getUserId());
        return ResponseEntity.ok().body(
                ResponseDto.<Void>builder()
                        .message("Successfully used coupon")
                        .build()
        );
    }
}

