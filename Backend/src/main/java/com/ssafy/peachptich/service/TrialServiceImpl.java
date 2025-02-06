package com.ssafy.peachptich.service;

import com.ssafy.peachptich.dto.response.TrialResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class TrialServiceImpl implements TrialService{
    private final RedisTemplate<String, String> redisTemplate;
    private static final String TRIAL_KEY_PREFIX = "trial:";
    private static final long TRIAL_EXPIRATION_DAYS = 7;

    public TrialResponse checkTrialAccess(String fingerprint) {
        String key = TRIAL_KEY_PREFIX + fingerprint;
        Boolean isFirst = redisTemplate.opsForValue()
                .setIfAbsent(key, "1", Duration.ofDays(TRIAL_EXPIRATION_DAYS));

        return new TrialResponse(
                Boolean.TRUE.equals(isFirst),
                isFirst ? "체험을 시작합니다" : "이미 체험을 사용하셨습니다"
        );
    }
}
