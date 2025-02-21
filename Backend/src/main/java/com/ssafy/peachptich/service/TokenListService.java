package com.ssafy.peachptich.service;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface TokenListService {
    void addTokenToList(String key, String value);      // key-value 형태로 리스트 추가
    boolean isContainToken(String key);   // key 기반으로 리스트 조회
    List<String> getTokenList(String key);       // key 기반으로 Redis Token list 조회
    void removeToken(String key);         // key 기반으로 리스트 내 요소 제거

    String getToken(String key);
}
