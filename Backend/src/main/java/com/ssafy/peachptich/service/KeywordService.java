package com.ssafy.peachptich.service;

import com.ssafy.peachptich.dto.response.KeywordResponse;

import java.util.List;

public interface KeywordService {
    List<KeywordResponse> getRandomKeywords();
    String getKeyword(Long keywordId);
}
