package com.ssafy.peachptich.service;

import io.lettuce.core.RedisConnectionException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.DataType;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenListServiceImpl implements TokenListService {
    private final RedisTemplate<String, String> redisTemplate;

    //TODO
    // 만료 시간 입력받고 redis에 저장되는 토큰 만료시간 설정해야 함
    @Override
    public void addTokenToList(String key, String value){

        try {
            if (key == null || value == null) {
                throw new IllegalArgumentException("Key or value cannot be null");
            }
            redisTemplate.opsForValue().set(key, value);
            log.debug("Token added to list - key: {}", key);
        } catch (Exception e) {
            log.error("Failed to add token to list - key: {}, error: {}", key, e.getMessage());
        }
    }

    @Override
    public boolean isContainToken(String key) {
        log.info("Checking token existence for key: {}", key);

        if (key == null || key.trim().isEmpty()) {
            log.warn("Key is null or empty");
            return false;
        }

        try {
            // String 타입으로 저장된 값을 확인
            String value = redisTemplate.opsForValue().get(key);
            boolean result = value != null && !value.isEmpty();
            log.info("Key {} exists with value: {}", key, result ? "present" : "not present");
            return result;

        } catch (Exception e) {
            log.error("Error checking token for key {}: {}", key, e.getMessage());
            return false;
        }
    }


    @Override
    public List<String> getTokenList(String key){
        try {
            if (key == null) {
                return Collections.emptyList();
            }
            String value = redisTemplate.opsForValue().get(key);
            return value != null ? Collections.singletonList(value) : Collections.emptyList();
        } catch (Exception e) {
            log.error("Failed to get token for key {}: {}", key, e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    public void removeToken(String key){
        try {
            if (key == null) {
                throw new IllegalArgumentException("Key cannot be null");
            }
            Boolean deleted = redisTemplate.delete(key);
            if (Boolean.TRUE.equals(deleted)) {
                log.debug("Token removed successfully - key: {}", key);
            } else {
                log.warn("Token not found for deletion - key: {}", key);
            }
        } catch (Exception e) {
            log.error("Failed to remove token - key: {}, error: {}", key, e.getMessage());
        }
    }
    
    // key 값에 해당하는 value 반환
    @Override
    public String getToken(String key){
        try {
            if (key == null){
                throw new IllegalArgumentException("Key cannot be null");
            }
            return redisTemplate.opsForValue().get(key);
        } catch (Exception e){
            log.error("Failed to get token - key: {}, error: {}", key, e.getMessage());
            return null;
        }
    }
}
