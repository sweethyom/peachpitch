package com.ssafy.peachptich.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TokenBlackBlacklistServiceImpl implements TokenBlacklistService {

    private final RedisTemplate<String, String> redisTemplate;
    private final String REDIS_BLACK_LIST_KEY = "tokenBlackList";

    @Override
    public void addTokenToList(
            String value){
        redisTemplate.opsForList().rightPush(REDIS_BLACK_LIST_KEY, value);
    }

    @Override
    public boolean isContainToken(String value){
        List<String> allItems = redisTemplate.opsForList().range(REDIS_BLACK_LIST_KEY, 0, -1);
        return allItems.stream()
                .anyMatch(item -> item.equals(value));
    }
    
    @Override
    public List<String> getTokenBlackList(){
        return redisTemplate.opsForList().range(REDIS_BLACK_LIST_KEY, 0, -1);
    }

    @Override
    public void removeToken(String value){
        redisTemplate.opsForList().remove(REDIS_BLACK_LIST_KEY, 0, value);
    }
}
