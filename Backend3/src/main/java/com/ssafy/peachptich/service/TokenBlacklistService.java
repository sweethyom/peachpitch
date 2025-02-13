//package com.ssafy.peachptich.service;
//
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//
///*
//    Redis 내에 Token BlackList를 관리하는 서비스
// */
//@Service
//public interface TokenBlacklistService {
//    void addTokenToList(String value);      // Redis key-value 형태로 리스트 추가
//    boolean isContainToken(String value);   // Redis key 기반으로 리스트 조회
//    List<String> getTokenBlackList();       // Redis key 기반으로 BlackList 조회
//    void removeToken(String value);         // Redis key 기반으로 리스트 내 요소 제거
//}
