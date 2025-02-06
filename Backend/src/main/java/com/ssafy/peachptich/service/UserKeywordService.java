package com.ssafy.peachptich.service;

import com.ssafy.peachptich.dto.response.RankResponseDto;

import java.util.List;

public interface UserKeywordService {
    void saveOrUpdate(Long userId, Long keywordId);
    List<RankResponseDto.KeywordRankResponseItem> rank();
}
