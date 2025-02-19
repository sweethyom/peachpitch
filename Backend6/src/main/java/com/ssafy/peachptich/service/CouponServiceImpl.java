package com.ssafy.peachptich.service;

import com.ssafy.peachptich.entity.HaveCoupon;
import com.ssafy.peachptich.entity.Item;
import com.ssafy.peachptich.entity.User;
import com.ssafy.peachptich.repository.HaveCouponRepository;
import com.ssafy.peachptich.repository.ItemRepository;
import com.ssafy.peachptich.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class CouponServiceImpl implements CouponService {
    private final RedisTemplate<String, String> redisTemplate;
    private final HaveCouponRepository haveCouponRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;


    private String getLoginKey(Long userId) {
        return "login:" + userId;
    }

    @Override
    @Transactional
    public void handleLoginCoupon(Long userId) {
        System.out.println("handleLoginCoupon started with userId: " + userId);
        String loginKey = getLoginKey(userId);

        System.out.println("Checking Redis key: " + loginKey);
        System.out.println("Redis key exists: " + redisTemplate.hasKey(loginKey));

        // 로그인 기록 확인
        if (!redisTemplate.hasKey(loginKey)) {
            System.out.println("No login record found, proceeding to issue coupon");
            // 당일 첫 로그인 처리
            setLoginRecord(userId);
            issueFreeCoupon(userId);
        } else {
            System.out.println("Login record already exists for today");
            throw new IllegalStateException("이미 오늘의 무료 쿠폰을 받았습니다.");  // 추가
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasReceivedFreeCouponToday(Long userId) {
        String loginKey = getLoginKey(userId);
        return redisTemplate.hasKey(loginKey);
    }

    private void setLoginRecord(Long userId) {
        String loginKey = getLoginKey(userId);
        redisTemplate.opsForValue().set(loginKey, "1");

        // 자정까지 만료시간 설정
        LocalDateTime midnight = LocalDateTime.now()
                .plusDays(1)
                .withHour(0)
                .withMinute(0)
                .withSecond(0);
        Duration ttl = Duration.between(LocalDateTime.now(), midnight);
        redisTemplate.expire(loginKey, ttl);
    }

    @Override
    @Transactional
    public void issueFreeCoupon(Long userId) {
        // 기존 유효한 쿠폰이 있는지 확인
        Optional<HaveCoupon> existingCoupon = haveCouponRepository
                .findByUserIdAndItemTypeAndExpirationDateAfter(
                        userId,
                        Item.ItemType.FREE,
                        LocalDateTime.now().withHour(0).withMinute(0).withSecond(0)
                );

        if (existingCoupon.isPresent()) {
            throw new IllegalStateException("이미 유효한 무료 쿠폰이 있습니다.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        Item freeCouponItem = itemRepository.findByType(Item.ItemType.FREE)
                .orElseThrow(() -> new IllegalStateException("무료 쿠폰 아이템이 설정되지 않았습니다."));

        HaveCoupon newCoupon = HaveCoupon.builder()
                .user(user)
                .item(freeCouponItem)
                .ea(1)
                .expirationDate(LocalDateTime.now()
                        .withHour(23).withMinute(59).withSecond(59))
                .build();

        haveCouponRepository.save(newCoupon);
    }


    @Transactional(readOnly = true)
    @Override
    public int getAvailableCoupons(Long userId) {
        try {
            // 디버깅을 위한 로그 추가
            log.debug("Checking coupons for userId: {}", userId);

            // null 체크 추가
            if (userId == null) {
                throw new IllegalArgumentException("userId cannot be null");
            }

            // 무료 쿠폰 수 조회
            Optional<HaveCoupon> freeCoupon = haveCouponRepository
                    .findByUserIdAndItemTypeAndExpirationDateAfter(
                            userId,
                            Item.ItemType.FREE,
                            LocalDateTime.now()
                    );

            // 유료 쿠폰 수 조회
            Optional<HaveCoupon> paidCoupon = haveCouponRepository
                    .findByUser_IdAndItem(
                            userId,
                            itemRepository.findByType(Item.ItemType.PAID)
                                    .orElseThrow(() -> new RuntimeException("Paid item not found"))
                    );
            log.info("쿠폰 수 조회 중");
            int freeCoupons = freeCoupon.map(HaveCoupon::getEa).orElse(0);
            int paidCoupons = paidCoupon.map(HaveCoupon::getEa).orElse(0);
            log.info("쿠폰 수 조회 중2");

            return freeCoupons + paidCoupons;
        } catch (Exception e) {
            log.error("Error while getting available coupons: ", e);
            throw e;
        }
    }


    @Override
    @Transactional
    public void useCoupon(Long userId) {
        // 무료 쿠폰 먼저 사용 시도
        Optional<HaveCoupon> freeCoupon = haveCouponRepository
                .findByUserIdAndItemTypeAndExpirationDateAfter(
                        userId,
                        Item.ItemType.FREE,
                        LocalDateTime.now()
                );

        if (freeCoupon.isPresent() && freeCoupon.get().getEa() > 0) {
            freeCoupon.get().useCoupon();
            return;
        }

        // 유료 쿠폰 사용 시도
        Optional<HaveCoupon> paidCoupon = haveCouponRepository
                .findByUser_IdAndItem(
                        userId,
                        itemRepository.findByType(Item.ItemType.PAID).orElseThrow()
                );

        if (paidCoupon.isPresent() && paidCoupon.get().getEa() > 0) {
            paidCoupon.get().useCoupon();
            return;
        }

        throw new IllegalStateException("사용 가능한 쿠폰이 없습니다.");
    }

    @Override
    @Transactional
    public void handlePaidCoupon(Long userId, Integer ea) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        Item paidCouponItem = itemRepository.findByType(Item.ItemType.PAID)
                .orElseThrow(() -> new IllegalStateException("유료 쿠폰 아이템이 설정되지 않았습니다."));

        Optional<HaveCoupon> existingCoupon = haveCouponRepository
                .findByUser_IdAndItem(userId, paidCouponItem);

        if (existingCoupon.isPresent()) {
            // 기존 보유 쿠폰이 있으면 수량만 증가
            existingCoupon.get().addCoupon(ea);
        } else {
            // 새로운 쿠폰 발급
            HaveCoupon newCoupon = HaveCoupon.builder()
                    .user(user)
                    .item(paidCouponItem)
                    .ea(ea)
                    .build();

            haveCouponRepository.save(newCoupon);
        }
    }
}


