package com.ssafy.peachptich.service;

import com.ssafy.peachptich.dto.response.RankResponseDto;

import java.util.List;
import java.util.Map;

public interface UserKeywordService {
    public void saveOrUpdate(Long userId, Long keywordId);
    public List<RankResponseDto.KeywordRankResponseItem> rank();
}
