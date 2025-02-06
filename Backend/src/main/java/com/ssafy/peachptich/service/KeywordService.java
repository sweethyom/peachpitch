package com.ssafy.peachptich.service;

import com.ssafy.peachptich.dto.response.KeywordResponseDto;

import java.util.List;

public interface KeywordService {
    List<KeywordResponseDto> getRandomKeywords();
    String getKeyword(Long keywordId);
}
